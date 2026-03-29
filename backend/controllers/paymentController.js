const mongoose = require('mongoose');
const Job = require('../models/Job');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// Sanitizer for wage strings
const parseWage = (wageStr) => {
    if (typeof wageStr === 'number') return wageStr;
    // Remove currency symbols, commas, and other non-numeric chars except digits and decimals
    const sanitized = (wageStr || "0").toString().replace(/[^\d.]/g, '');
    return parseFloat(sanitized) || 0;
};

// @desc    Secure payment for job (Move to Escrow)
// @route   POST /api/payments/secure
// @access  Private (Owner/User Only)
exports.securePayment = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { jobId, amount } = req.body;
        
        const job = await Job.findById(jobId).session(session);
        if (!job) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Verify owner
        if (job.postedBy.toString() !== req.user.id) {
            await session.abortTransaction();
            session.endSession();
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // VALIDATION: Must be booked first
        if (job.status !== 'booked') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: 'Worker must be booked before securing payment' });
        }

        // Check if already secured
        if (job.paymentStatus === 'secured') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: 'Payment already secured' });
        }

        // SANITIZE MONEY: Handle strings like "₹1,500" properly
        const secureAmount = parseWage(amount || job.wage);
        
        const user = await User.findById(req.user.id).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Initialize wallet if missing
        if (!user.wallet) {
            user.wallet = { balance: 0, pending: 0 };
        }

        if (user.wallet.balance < secureAmount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: `Insufficient balance. Need ₹${secureAmount}, you have ₹${user.wallet.balance}` });
        }

        // Escrow logic (Money Cut)
        user.wallet.balance -= secureAmount;
        user.wallet.pending += secureAmount;
        
        user.markModified('wallet');
        await user.save({ session });

        // Update Job: In-Progress + Secured
        job.paymentStatus = 'secured';
        job.paymentAmount = secureAmount;
        job.status = 'in-progress';
        await job.save({ session });

        // Create transaction history for client
        await Transaction.create([{
            userId: req.user.id,
            amount: -secureAmount,
            type: 'debit',
            status: 'pending',
            relatedTo: job._id,
            onModel: 'Job',
            description: `Payment Secured for job: ${job.title}`
        }], { session });

        // NOTIFY WORKER: Work is officially confirmed and payment is in Escrow
        await Notification.create([{
            userId: job.assignedWorker,
            message: `Employer has secured ₹${secureAmount} in Escrow for "${job.title}". You can start work now!`,
            type: 'payment',
            relatedId: job._id,
            onModel: 'Job'
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: 'Payment secured in escrow. Job is now in-progress.',
            data: job
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Secure Payment Error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Release payment to worker
// @route   POST /api/payments/release
// @access  Private (Owner/User Only)
exports.releasePayment = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { jobId, extraExpense = 0 } = req.body;

        const job = await Job.findById(jobId).session(session);
        if (!job) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Verify owner
        if (job.postedBy.toString() !== req.user.id) {
            await session.abortTransaction();
            session.endSession();
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        if (job.paymentStatus !== 'secured') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: 'Payment not secured yet' });
        }

        if (job.status !== 'completed') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: 'Job must be marked as completed first' });
        }

        // ── Feedback Gate ──────────────────────────────────────────────────────
        if (!job.feedbackSubmitted) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Please submit feedback for the worker before releasing payment.',
                code: 'FEEDBACK_REQUIRED'
            });
        }

        const baseAmount = Number(job.paymentAmount || job.wage);
        const extraAmount = Number(extraExpense) || 0;
        const totalAmount = baseAmount + extraAmount;

        const client = await User.findById(req.user.id).session(session);
        const workerId = job.assignedWorker;

        if (!workerId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: 'No worker assigned' });
        }

        const worker = await User.findById(workerId).session(session);
        if (!worker) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: 'Worker not found' });
        }

        // Initialize wallets if missing
        if (!client.wallet) client.wallet = { balance: 0, pending: 0 };
        if (!worker.wallet) worker.wallet = { balance: 0, pending: 0 };

        // Verify client has enough balance for the *extra* expense (since base is already in pending escrow)
        if (extraAmount > 0 && client.wallet.balance < extraAmount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
                success: false, 
                message: `Insufficient balance for extra expenses. You need ₹${extraAmount} more in your wallet, but only have ₹${client.wallet.balance}.` 
            });
        }

        // Move from client pending to worker balance (Base Wage)
        client.wallet.pending -= baseAmount;
        // Deduct extra expense directly from client's main balance
        client.wallet.balance -= extraAmount;
        // Add total to worker's balance
        worker.wallet.balance += totalAmount;

        client.markModified('wallet');
        worker.markModified('wallet');
        
        await client.save({ session });
        await worker.save({ session });

        job.paymentStatus = 'released';
        job.extraExpense = extraAmount;
        await job.save({ session });

        // Update client transaction (the escrowed one)
        const clientTx = await Transaction.findOne({ userId: req.user.id, relatedTo: job._id, status: 'pending' }).session(session);
        if (clientTx) {
            clientTx.status = 'completed';
            await clientTx.save({ session });
        }

        // If there was an extra expense, create a new debit transaction for the client
        if (extraAmount > 0) {
            await Transaction.create([{
                userId: req.user.id,
                amount: -extraAmount,
                type: 'debit',
                status: 'completed',
                relatedTo: job._id,
                onModel: 'Job',
                description: `Extra Expenses Paid for job: ${job.title}`
            }], { session });
        }

        // Create credit transaction for worker (Total Amount)
        await Transaction.create([{
            userId: workerId,
            amount: totalAmount,
            type: 'credit',
            status: 'completed',
            relatedTo: job._id,
            onModel: 'Job',
            description: `Payment Received (Wage + Extra) for job: ${job.title}`
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: 'Payment released to worker successfully',
            data: job
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Release Payment Error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    securePayment: exports.securePayment,
    releasePayment: exports.releasePayment
};
