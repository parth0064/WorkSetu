const express = require('express');
const {
    createJob,
    getJobs,
    getMyJobs,
    applyForJob,
    bookWorker,
    completeJob,
    getJobRequests,
    updateJobRequestStatus,
    getJobById,
    getMyAssignedJobs
} = require('../controllers/jobController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getJobs);
router.get('/my', protect, getMyJobs);
router.get('/my-assigned', protect, authorize('worker'), getMyAssignedJobs);

router.post('/create', protect, authorize('user', 'constructor'), createJob);
router.post('/apply/:id', protect, authorize('worker'), applyForJob);
router.post('/book', protect, authorize('user', 'constructor'), bookWorker);
router.post('/complete', protect, authorize('user', 'constructor'), completeJob);

router.get('/requests', protect, authorize('worker'), getJobRequests);
router.get('/:id', protect, getJobById);
router.put('/requests/:id', protect, authorize('worker'), updateJobRequestStatus);

module.exports = router;
