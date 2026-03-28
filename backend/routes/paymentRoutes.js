const express = require('express');
const { 
    securePayment, 
    releasePayment 
} = require('../controllers/paymentController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/secure', protect, authorize('user', 'constructor'), securePayment);
router.post('/release', protect, authorize('user', 'constructor'), releasePayment);

module.exports = router;
