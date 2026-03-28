const express = require('express');
const { 
    getExpenses, 
    addExpense, 
    deleteExpense 
} = require('../controllers/expenseController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('worker'), getExpenses);
router.post('/add', protect, authorize('worker'), addExpense);
router.delete('/:id', protect, authorize('worker'), deleteExpense);

module.exports = router;
