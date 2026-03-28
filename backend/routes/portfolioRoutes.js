const express = require('express');
const {
    addPortfolioEntry,
    getMyPortfolio,
    getWorkerPortfolio,
    updatePortfolioEntry,
    deletePortfolioEntry
} = require('../controllers/portfolioController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Cloudinary multi-image upload
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const portfolioStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'worksetu-portfolio',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto' }]
    }
});
const uploadPortfolio = multer({ storage: portfolioStorage });

// Routes
router.get('/me', protect, getMyPortfolio);
router.get('/:userId', getWorkerPortfolio);

router.post('/', protect, authorize('worker'), uploadPortfolio.array('images', 5), addPortfolioEntry);
router.put('/:id', protect, authorize('worker'), updatePortfolioEntry);
router.delete('/:id', protect, authorize('worker'), deletePortfolioEntry);

module.exports = router;
