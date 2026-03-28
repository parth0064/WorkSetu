const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Get user wallet details
// @route   GET /api/wallet
// @access  Private
exports.getWallet = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('wallet');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Initialize wallet if missing (for legacy users)
        if (!user.wallet) {
            user.wallet = { balance: 0, pending: 0 };
        }

        res.status(200).json({
            success: true,
            data: user.wallet
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add funds to wallet (Simulated)
// @route   POST /api/wallet/add
// @access  Private
exports.addFunds = async (req, res, next) => {
    try {
        const { amount } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Initialize wallet if missing
        if (!user.wallet) {
            user.wallet = { balance: 0, pending: 0 };
        }

        user.wallet.balance += Number(amount);
        
        // Mark modified since it's a nested object
        user.markModified('wallet');
        await user.save();

        // Create transaction
        await Transaction.create({
            userId: req.user.id,
            amount: Number(amount),
            type: 'credit',
            status: 'completed',
            description: 'Funds Added to Wallet'
        });

        res.status(200).json({
            success: true,
            data: user.wallet
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort('-createdAt');

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getWallet: exports.getWallet,
    addFunds: exports.addFunds,
    getTransactions: exports.getTransactions
};
