const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Leave = require('../models/Leave');
const User = require('../models/User');
const { protect, authorize, checkSubscription } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

router.get('/', protect, checkSubscription, async (req, res) => {
    try {
        const { status, employeeId, startDate, endDate } = req.query;
        
        let query = { company: req.user.company };
        
        if (req.user.role === 'employee') {
            query.employee = req.user._id;
        } else if (employeeId) {
            query.employee = employeeId;
        }
        
        if (status) {
            query.status = status;
        }
        
        if (startDate && endDate) {
            query.startDate = { $lte: new Date(endDate) };
            query.endDate = { $gte: new Date(startDate) };
        }
        
        const leaves = await Leave.find(query)
            .populate('employee', 'name email designation')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: leaves.length,
            data: leaves
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching leave requests'
        });
    }
});

router.get('/:id', protect, checkSubscription, async (req, res) => {
    try {
        const leave = await Leave.findOne({
            _id: req.params.id,
            company: req.user.company
        })
            .populate('employee', 'name email designation')
            .populate('reviewedBy', 'name');
        
        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }
        
        if (req.user.role === 'employee' && leave.employee._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this leave request'
            });
        }
        
        res.json({
            success: true,
            data: leave
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching leave request'
        });
    }
});

router.post('/', protect, checkSubscription, [
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('type').isIn(['sick', 'casual', 'annual', 'unpaid']).withMessage('Invalid leave type'),
    body('reason').notEmpty().withMessage('Reason is required'),
    validate
], async (req, res) => {
    try {
        const { startDate, endDate, type, reason } = req.body;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (end < start) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }
        
        const overlapping = await Leave.findOne({
            company: req.user.company,
            employee: req.user._id,
            status: { $ne: 'rejected' },
            $or: [
                {
                    startDate: { $lte: end },
                    endDate: { $gte: start }
                }
            ]
        });
        
        if (overlapping) {
            return res.status(400).json({
                success: false,
                message: 'You already have a leave request for this period'
            });
        }
        
        const leave = await Leave.create({
            company: req.user.company,
            employee: req.user._id,
            startDate: start,
            endDate: end,
            type,
            reason,
            status: 'pending'
        });
        
        res.status(201).json({
            success: true,
            message: 'Leave request submitted successfully',
            data: leave
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error submitting leave request'
        });
    }
});

router.put('/:id/approve', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const leave = await Leave.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }
        
        if (leave.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Leave request has already been reviewed'
            });
        }
        
        leave.status = 'approved';
        leave.reviewedBy = req.user._id;
        leave.reviewedAt = new Date();
        leave.reviewNotes = req.body.notes || '';
        
        await leave.save();
        
        res.json({
            success: true,
            message: 'Leave request approved',
            data: leave
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error approving leave request'
        });
    }
});

router.put('/:id/reject', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const leave = await Leave.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }
        
        if (leave.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Leave request has already been reviewed'
            });
        }
        
        leave.status = 'rejected';
        leave.reviewedBy = req.user._id;
        leave.reviewedAt = new Date();
        leave.reviewNotes = req.body.notes || '';
        
        await leave.save();
        
        res.json({
            success: true,
            message: 'Leave request rejected',
            data: leave
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error rejecting leave request'
        });
    }
});

router.delete('/:id', protect, checkSubscription, async (req, res) => {
    try {
        const leave = await Leave.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }
        
        if (req.user.role === 'employee') {
            if (leave.employee.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to delete this leave request'
                });
            }
            
            if (leave.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete a reviewed leave request'
                });
            }
        }
        
        await leave.deleteOne();
        
        res.json({
            success: true,
            message: 'Leave request deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting leave request'
        });
    }
});

module.exports = router;