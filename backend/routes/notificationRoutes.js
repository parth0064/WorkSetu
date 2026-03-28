const express = require('express');
const {
    getNotifications,
    markAsRead,
    clearNotifications
} = require('../controllers/notificationController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.delete('/clear', clearNotifications);

module.exports = router;
