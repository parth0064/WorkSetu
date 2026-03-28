const Expense = require('../models/Expense');

// @desc    Get user expenses
// @route   GET /api/expenses
// @access  Private (Worker Only)
exports.getExpenses = async (req, res, next) => {
    try {
        const expenses = await Expense.find({ workerId: req.user.id }).sort('-date');
        
        res.status(200).json({
            success: true,
            count: expenses.length,
            data: expenses
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add new expense
// @route   POST /api/expenses/add
// @access  Private (Worker Only)
exports.addExpense = async (req, res, next) => {
    try {
        const { title, amount, date } = req.body;
        
        if (!title || !amount) {
            return res.status(400).json({ success: false, message: 'Please provide title and amount' });
        }

        const expense = await Expense.create({
            workerId: req.user.id,
            title,
            amount,
            date: date || Date.now()
        });

        res.status(201).json({
            success: true,
            data: expense
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private (Worker Only)
exports.deleteExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        // Verify worker
        if (expense.workerId.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await expense.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Expense removed'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
