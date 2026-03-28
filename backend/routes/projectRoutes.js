const express = require('express');
const {
    createProject,
    updateProject,
    getProjects,
    getAllProjects,
    getMyProjects,
    getAssignedProjects,
    getProjectById,
    deleteProject,
    getApplicants,
    assignWorker,
    assignWorkerToProject,
    requestWorker,
    applyToProject,
    getMyApplications,
    markDayComplete,
    getProjectWorkHistory,
    updateProgress,
    completeProject
} = require('../controllers/projectController');

const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// ─── PUBLIC ───────────────────────────────────────────────────────────────────
router.get('/', getProjects);                    // Public listings for workers

// ─── WORKER ROUTES ────────────────────────────────────────────────────────────
router.get('/all', protect, getAllProjects);                         // All public projects
router.get('/assigned', protect, authorize('worker'), getAssignedProjects);  // My assigned projects
router.get('/my-applications', protect, authorize('worker'), getMyApplications);
router.post('/apply', protect, authorize('worker'), applyToProject);
router.post('/mark-day', protect, authorize('worker'), markDayComplete);
router.get('/work-history', protect, authorize('worker'), getProjectWorkHistory);

// ─── CONSTRUCTOR ROUTES ───────────────────────────────────────────────────────
router.get('/my', protect, authorize('constructor'), getMyProjects);
router.post('/create', protect, authorize('constructor'), createProject);
router.post('/assign', protect, authorize('constructor'), assignWorker);
router.post('/assign-worker', protect, authorize('constructor'), assignWorkerToProject); // legacy
router.post('/request-worker', protect, authorize('constructor'), requestWorker);
router.post('/update-progress', protect, authorize('constructor'), updateProgress);
router.post('/complete', protect, authorize('constructor'), completeProject);

// ─── PARAMETERIZED (must come AFTER named routes) ────────────────────────────
router.get('/:id', protect, getProjectById);
router.patch('/:id', protect, authorize('constructor'), updateProject);
router.get('/:id/applicants', protect, authorize('constructor'), getApplicants);
router.delete('/:id', protect, authorize('constructor'), deleteProject);

module.exports = router;
