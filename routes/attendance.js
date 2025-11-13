const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect, authorize, checkSubscription } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

router.get('/', protect, checkSubscription, async (req, res) => {
    try {
        const { startDate, endDate, employeeId, status } = req.query;
        
        let query = { company: req.user.company };
        
        if (req.user.role === 'employee') {
            query.employee = req.user._id;
        } else if (employeeId) {
            query.employee = employeeId;
        }
        
        if (startDate && endDate) {
            query.date = { 
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        if (status) {
            query.status = status;
        }
        
        const attendance = await Attendance.find(query)
            .populate('employee', 'name email designation')
            .sort({ date: -1 })
            .limit(100);
        
        res.json({
            success: true,
            count: attendance.length,
            data: attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance records'
        });
    }
});

router.post('/checkin', protect, checkSubscription, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existing = await Attendance.findOne({
            company: req.user.company,
            employee: req.user._id,
            date: { $gte: today }
        });
        
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'You have already checked in today'
            });
        }
        
        const now = new Date();
        const checkInTime = now.toTimeString().split(' ')[0].substring(0, 5);
        
        const status = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15) 
            ? 'late' 
            : 'present';
        
        const attendance = await Attendance.create({
            company: req.user.company,
            employee: req.user._id,
            date: new Date(),
            checkInTime,
            status
        });
        
        res.status(201).json({
            success: true,
            message: 'Checked in successfully',
            data: attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking in'
        });
    }
});

router.post('/checkout', protect, checkSubscription, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const attendance = await Attendance.findOne({
            company: req.user.company,
            employee: req.user._id,
            date: { $gte: today }
        });
        
        if (!attendance) {
            return res.status(400).json({
                success: false,
                message: 'Please check in first'
            });
        }
        
        if (attendance.checkOutTime) {
            return res.status(400).json({
                success: false,
                message: 'You have already checked out today'
            });
        }
        
        const now = new Date();
        attendance.checkOutTime = now.toTimeString().split(' ')[0].substring(0, 5);
        await attendance.save();
        
        res.json({
            success: true,
            message: 'Checked out successfully',
            data: attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking out'
        });
    }
});

router.post('/', protect, authorize('admin'), checkSubscription, [
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('status').isIn(['present', 'absent', 'late', 'half-day']).withMessage('Invalid status'),
    validate
], async (req, res) => {
    try {
        const { employeeId, date, status, checkInTime, checkOutTime, notes } = req.body;
        
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
        
        let attendance = await Attendance.findOne({
            company: req.user.company,
            employee: employeeId,
            date: new Date(date)
        });
        
        if (attendance) {
            attendance.status = status;
            attendance.checkInTime = checkInTime || attendance.checkInTime;
            attendance.checkOutTime = checkOutTime || attendance.checkOutTime;
            attendance.notes = notes || attendance.notes;
            await attendance.save();
        } else {
            attendance = await Attendance.create({
                company: req.user.company,
                employee: employeeId,
                date: new Date(date),
                checkInTime: checkInTime || '09:00',
                checkOutTime: checkOutTime || '18:00',
                status,
                notes
            });
        }
        
        res.status(201).json({
            success: true,
            message: 'Attendance marked successfully',
            data: attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error marking attendance'
        });
    }
});

router.delete('/:id', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const attendance = await Attendance.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found'
            });
        }
        
        await attendance.deleteOne();
        
        res.json({
            success: true,
            message: 'Attendance record deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting attendance record'
        });
    }
});

router.get('/today/status', protect, checkSubscription, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const attendance = await Attendance.findOne({
            company: req.user.company,
            employee: req.user._id,
            date: { $gte: today }
        });
        
        res.json({
            success: true,
            data: attendance || null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching today\'s status'
        });
    }
});

module.exports = router;