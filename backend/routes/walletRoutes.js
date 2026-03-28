const express = require('express');
const { 
    getWallet, 
    addFunds, 
    getTransactions 
} = require('../controllers/walletController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWallet);
router.post('/add', protect, addFunds);
router.get('/transactions', protect, getTransactions);

module.exports = router;
