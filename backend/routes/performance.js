const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Performance = require('../models/Performance');
const User = require('../models/User');
const { protect, authorize, checkSubscription } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Get all performance reviews
router.get('/', protect, checkSubscription, async (req, res) => {
    try {
        const { employeeId, reviewPeriod, status } = req.query;
        
        let query = { company: req.user.company };
        
        if (req.user.role === 'employee') {
            query.employee = req.user._id;
        } else if (employeeId) {
            query.employee = employeeId;
        }
        
        if (reviewPeriod) query.reviewPeriod = reviewPeriod;
        if (status) query.status = status;
        
        const reviews = await Performance.find(query)
            .populate('employee', 'name email designation')
            .populate('reviewer', 'name')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching performance reviews'
        });
    }
});

// Create performance review
router.post('/', protect, authorize('admin'), checkSubscription, [
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('reviewPeriod').notEmpty().withMessage('Review period is required'),
    body('reviewType').isIn(['quarterly', 'annual', 'probation', 'project']).withMessage('Invalid review type'),
    validate
], async (req, res) => {
    try {
        const { employeeId, reviewPeriod, reviewType, goals } = req.body;
        
        const employee = await User.findOne({
            _id: employeeId,
            company: req.user.company
        });
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        
        const existing = await Performance.findOne({
            company: req.user.company,
            employee: employeeId,
            reviewPeriod
        });
        
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Performance review already exists for this period'
            });
        }
        
        const review = await Performance.create({
            company: req.user.company,
            employee: employeeId,
            reviewPeriod,
            reviewType,
            reviewer: req.user._id,
            goals: goals || [],
            status: 'draft'
        });
        
        res.status(201).json({
            success: true,
            message: 'Performance review created successfully',
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating performance review'
        });
    }
});

// Update performance review
router.put('/:id', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const review = await Performance.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Performance review not found'
            });
        }
        
        const allowedFields = [
            'goals', 'ratings', 'strengths', 'areasOfImprovement',
            'managerComments', 'actionItems', 'status'
        ];
        
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                review[field] = req.body[field];
            }
        });
        
        // Calculate overall rating
        if (review.ratings) {
            const ratingsArray = Object.values(review.ratings).filter(r => r);
            if (ratingsArray.length > 0) {
                review.overallRating = (ratingsArray.reduce((a, b) => a + b, 0) / ratingsArray.length).toFixed(1);
            }
        }
        
        if (req.body.status === 'completed' && review.status !== 'completed') {
            review.completedAt = new Date();
        }
        
        await review.save();
        
        res.json({
            success: true,
            message: 'Performance review updated successfully',
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating performance review'
        });
    }
});

// Add employee comments
router.post('/:id/employee-comment', protect, checkSubscription, async (req, res) => {
    try {
        const review = await Performance.findOne({
            _id: req.params.id,
            company: req.user.company,
            employee: req.user._id
        });
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Performance review not found'
            });
        }
        
        review.employeeComments = req.body.comments;
        await review.save();
        
        res.json({
            success: true,
            message: 'Comments added successfully',
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding comments'
        });
    }
});

// Delete performance review
router.delete('/:id', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const review = await Performance.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Performance review not found'
            });
        }
        
        await review.deleteOne();
        
        res.json({
            success: true,
            message: 'Performance review deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting performance review'
        });
    }
});

module.exports = router;