const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Onboarding = require('../models/Onboarding');
const User = require('../models/User');
const { protect, authorize, checkSubscription } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Get all onboarding records
router.get('/', protect, checkSubscription, async (req, res) => {
    try {
        const { status, employeeId } = req.query;
        
        let query = { company: req.user.company };
        
        if (req.user.role === 'employee') {
            query.employee = req.user._id;
        } else if (employeeId) {
            query.employee = employeeId;
        }
        
        if (status) query.status = status;
        
        const onboardings = await Onboarding.find(query)
            .populate('employee', 'name email designation joinDate')
            .populate('buddy', 'name email')
            .populate('tasks.assignedTo', 'name')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: onboardings.length,
            data: onboardings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching onboarding records'
        });
    }
});

// Create onboarding
router.post('/', protect, authorize('admin'), checkSubscription, [
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    validate
], async (req, res) => {
    try {
        const { employeeId, startDate, tasks, buddy } = req.body;
        
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
        
        const existing = await Onboarding.findOne({
            company: req.user.company,
            employee: employeeId
        });
        
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Onboarding already exists for this employee'
            });
        }
        
        // Default onboarding tasks
        const defaultTasks = [
            {
                title: 'Complete personal information form',
                category: 'documentation',
                priority: 'high',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Submit required documents (ID, certificates)',
                category: 'documentation',
                priority: 'high',
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'IT setup - Email & systems access',
                category: 'system-access',
                priority: 'high',
                dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Assign laptop/equipment',
                category: 'equipment',
                priority: 'high',
                dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Company orientation & culture training',
                category: 'training',
                priority: 'medium',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Meet team members',
                category: 'introduction',
                priority: 'medium',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Review company policies',
                category: 'training',
                priority: 'medium',
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            }
        ];
        
        const onboarding = await Onboarding.create({
            company: req.user.company,
            employee: employeeId,
            startDate,
            status: 'in-progress',
            tasks: tasks || defaultTasks,
            buddy
        });
        
        res.status(201).json({
            success: true,
            message: 'Onboarding created successfully',
            data: onboarding
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating onboarding'
        });
    }
});

// Update task status
router.put('/:id/tasks/:taskId', protect, checkSubscription, async (req, res) => {
    try {
        const { status, notes } = req.body;
        
        const onboarding = await Onboarding.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!onboarding) {
            return res.status(404).json({
                success: false,
                message: 'Onboarding not found'
            });
        }
        
        const task = onboarding.tasks.id(req.params.taskId);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        task.status = status;
        if (notes) task.notes = notes;
        if (status === 'completed') task.completedAt = new Date();
        
        // Check if all tasks completed
        const allCompleted = onboarding.tasks.every(t => t.status === 'completed' || t.status === 'skipped');
        if (allCompleted) {
            onboarding.status = 'completed';
            onboarding.completionDate = new Date();
        }
        
        await onboarding.save();
        
        res.json({
            success: true,
            message: 'Task updated successfully',
            data: onboarding
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating task'
        });
    }
});

// Submit feedback
router.post('/:id/feedback', protect, checkSubscription, async (req, res) => {
    try {
        const { rating, comments } = req.body;
        
        const onboarding = await Onboarding.findOne({
            _id: req.params.id,
            company: req.user.company,
            employee: req.user._id
        });
        
        if (!onboarding) {
            return res.status(404).json({
                success: false,
                message: 'Onboarding not found'
            });
        }
        
        onboarding.feedback = {
            rating,
            comments,
            submittedAt: new Date()
        };
        
        await onboarding.save();
        
        res.json({
            success: true,
            message: 'Feedback submitted successfully',
            data: onboarding
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting feedback'
        });
    }
});

module.exports = router;