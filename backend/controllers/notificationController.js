const Notification = require('../models/Notification');

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        // Verify owner
        if (notification.userId.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications/clear
// @access  Private
exports.clearNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ userId: req.user.id });

        res.status(200).json({
            success: true,
            message: 'Notifications cleared'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
