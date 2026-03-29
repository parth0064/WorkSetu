const express = require('express');
const {
    addPortfolioEntry,
    getMyPortfolio,
    getWorkerPortfolio,
    updatePortfolioEntry,
    deletePortfolioEntry
} = require('../controllers/portfolioController');

const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');

const router = express.Router();

// Use memory storage — no Cloudinary needed
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Routes
router.get('/me', protect, getMyPortfolio);
router.get('/:userId', getWorkerPortfolio);

router.post('/', protect, authorize('worker'), upload.array('images', 5), addPortfolioEntry);
router.put('/:id', protect, authorize('worker'), updatePortfolioEntry);
router.delete('/:id', protect, authorize('worker'), deletePortfolioEntry);

module.exports = router;
