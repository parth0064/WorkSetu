const express = require('express');
const {
    submitFeedback,
    getJobFeedback,
    getWorkerReviews,
    // Legacy aliases
    createReview,
    getReviewsForUser
} = require('../controllers/reviewController');

const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Submit feedback for a job (must be job owner, after completion)
router.post('/', protect, submitFeedback);

// Check if feedback was submitted for a specific job
router.get('/job/:jobId', protect, getJobFeedback);

// Get all reviews for a worker (public)
router.get('/:userId', getWorkerReviews);

module.exports = router;
