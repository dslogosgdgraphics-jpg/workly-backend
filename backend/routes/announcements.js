const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body } = require('express-validator');
const Announcement = require('../models/Announcement');
const { protect, authorize, checkSubscription } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { uploadFile } = require('../utils/fileUpload');
const { createNotification } = require('../utils/notifications');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Get all announcements
router.get('/', protect, checkSubscription, async (req, res) => {
    try {
        const { type, status } = req.query;
        
        let query = { 
            company: req.user.company,
            status: status || 'published'
        };
        
        // Filter based on target audience
        if (req.user.role === 'employee') {
            query.$or = [
                { targetAudience: 'all' },
                { targetAudience: 'department', departments: req.user.department },
                { targetAudience: 'specific', specificEmployees: req.user._id }
            ];
        }
        
        if (type) query.type = type;
        
        const announcements = await Announcement.find(query)
            .populate('author', 'name profilePhoto')
            .populate('reactions.employee', 'name profilePhoto')
            .populate('comments.employee', 'name profilePhoto')
            .sort({ isPinned: -1, publishDate: -1 })
            .limit(50);
        
        // Mark as read
        for (const announcement of announcements) {
            const alreadyRead = announcement.readBy.some(
                r => r.employee.toString() === req.user._id.toString()
            );
            
            if (!alreadyRead && req.user.role === 'employee') {
                announcement.readBy.push({
                    employee: req.user._id,
                    readAt: new Date()
                });
                await announcement.save();
            }
        }
        
        res.json({
            success: true,
            count: announcements.length,
            data: announcements
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching announcements'
        });
    }
});

// Create announcement
router.post('/', protect, authorize('admin'), checkSubscription, upload.array('attachments', 5), [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    validate
], async (req, res) => {
    try {
        const { title, content, type, priority, targetAudience, departments, specificEmployees, expiryDate, isPinned } = req.body;
        
        const attachments = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const fileUrl = await uploadFile(file);
                attachments.push({
                    fileName: file.originalname,
                    fileUrl
                });
            }
        }
        
        const announcement = await Announcement.create({
            company: req.user.company,
            title,
            content,
            type: type || 'general',
            priority: priority || 'medium',
            author: req.user._id,
            targetAudience: targetAudience || 'all',
            departments: departments ? JSON.parse(departments) : [],
            specificEmployees: specificEmployees ? JSON.parse(specificEmployees) : [],
            attachments,
            expiryDate,
            isPinned: isPinned === 'true',
            status: 'published'
        });
        
        // Send notifications to target employees
        await createNotification({
            company: req.user.company,
            targetAudience,
            departments: departments ? JSON.parse(departments) : [],
            specificEmployees: specificEmployees ? JSON.parse(specificEmployees) : [],
            type: 'announcement',
            title: `New Announcement: ${title}`,
            message: content.substring(0, 100) + '...',
            link: `/announcements/${announcement._id}`
        });
        
        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            data: announcement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating announcement'
        });
    }
});

// Add reaction
router.post('/:id/react', protect, checkSubscription, async (req, res) => {
    try {
        const { type } = req.body;
        
        const announcement = await Announcement.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }
        
        // Remove existing reaction from this user
        announcement.reactions = announcement.reactions.filter(
            r => r.employee.toString() !== req.user._id.toString()
        );
        
        // Add new reaction
        announcement.reactions.push({
            employee: req.user._id,
            type,
            createdAt: new Date()
        });
        
        await announcement.save();
        
        res.json({
            success: true,
            message: 'Reaction added',
            data: announcement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding reaction'
        });
    }
});

// Add comment
router.post('/:id/comment', protect, checkSubscription, [
    body('content').notEmpty().withMessage('Comment content is required'),
    validate
], async (req, res) => {
    try {
        const announcement = await Announcement.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }
        
        announcement.comments.push({
            employee: req.user._id,
            content: req.body.content,
            createdAt: new Date()
        });
        
        await announcement.save();
        
        res.json({
            success: true,
            message: 'Comment added',
            data: announcement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding comment'
        });
    }
});

// Delete announcement
router.delete('/:id', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const announcement = await Announcement.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }
        
        await announcement.deleteOne();
        
        res.json({
            success: true,
            message: 'Announcement deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting announcement'
        });
    }
});

module.exports = router;