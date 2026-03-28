const express = require('express');
const {
    getUsers,
    getWorkers,
    getUserProfile,
    updateUserProfile
} = require('../controllers/userController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

const { upload } = require('../config/cloudinary');

router.get('/', protect, getUsers);
router.get('/workers', getWorkers);
router.get('/:id', getUserProfile);

router.put('/profile', protect, updateUserProfile);
router.post('/profile-photo', protect, upload.single('image'), (require('../controllers/userController')).uploadProfilePhoto);

module.exports = router;
