const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect, checkSubscription } = require('../middleware/auth');

// Get user notifications
router.get('/', protect, checkSubscription, async (req, res) => {
    try {
        const { isRead, limit = 50 } = req.query;
        
        let query = {
            company: req.user.company,
            recipient: req.user._id
        };
        
        if (isRead !== undefined) {
            query.isRead = isRead === 'true';
        }
        
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));
        
        const unreadCount = await Notification.countDocuments({
            company: req.user.company,
            recipient: req.user._id,
            isRead: false
        });
        
        res.json({
            success: true,
            count: notifications.length,
            unreadCount,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications'
        });
    }
});

// Mark notification as read
router.put('/:id/read', protect, checkSubscription, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            company: req.user.company,
            recipient: req.user._id
        });
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        
        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();
        
        res.json({
            success: true,
            message: 'Notification marked as read',
            data: notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating notification'
        });
    }
});

// Mark all as read
router.put('/mark-all-read', protect, checkSubscription, async (req, res) => {
    try {
        await Notification.updateMany(
            {
                company: req.user.company,
                recipient: req.user._id,
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );
        
        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating notifications'
        });
    }
});

// Delete notification
router.delete('/:id', protect, checkSubscription, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            company: req.user.company,
            recipient: req.user._id
        });
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        
        await notification.deleteOne();
        
        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting notification'
        });
    }
});

module.exports = router;