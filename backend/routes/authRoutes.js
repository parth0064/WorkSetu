const express = require('express');
const {
    register,
    login,
    getMe,
    completeOnboarding
} = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/complete-onboarding', protect, completeOnboarding);

module.exports = router;
