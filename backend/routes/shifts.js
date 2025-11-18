const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { Shift, Schedule } = require('../models/Shift');
const User = require('../models/User');
const { protect, authorize, checkSubscription } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// ========== SHIFT MANAGEMENT ==========

// Get all shifts
router.get('/shifts', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const shifts = await Shift.find({ 
            company: req.user.company 
        }).sort({ name: 1 });
        
        res.json({
            success: true,
            count: shifts.length,
            data: shifts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching shifts'
        });
    }
});

// Create shift
router.post('/shifts', protect, authorize('admin'), checkSubscription, [
    body('name').notEmpty().withMessage('Shift name is required'),
    body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid start time'),
    body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid end time'),
    validate
], async (req, res) => {
    try {
        const shift = await Shift.create({
            company: req.user.company,
            ...req.body
        });
        
        res.status(201).json({
            success: true,
            message: 'Shift created successfully',
            data: shift
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating shift'
        });
    }
});

// Update shift
router.put('/shifts/:id', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const shift = await Shift.findOneAndUpdate(
            { _id: req.params.id, company: req.user.company },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!shift) {
            return res.status(404).json({
                success: false,
                message: 'Shift not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Shift updated successfully',
            data: shift
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating shift'
        });
    }
});

// Delete shift
router.delete('/shifts/:id', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const shift = await Shift.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!shift) {
            return res.status(404).json({
                success: false,
                message: 'Shift not found'
            });
        }
        
        // Check if shift is being used
        const scheduleCount = await Schedule.countDocuments({
            company: req.user.company,
            shift: req.params.id
        });
        
        if (scheduleCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete shift. It's being used in ${scheduleCount} schedules.`
            });
        }
        
        await shift.deleteOne();
        
        res.json({
            success: true,
            message: 'Shift deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting shift'
        });
    }
});

// ========== SCHEDULE MANAGEMENT ==========

// Get schedules
router.get('/schedules', protect, checkSubscription, async (req, res) => {
    try {
        const { startDate, endDate, employeeId } = req.query;
        
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
        
        const schedules = await Schedule.find(query)
            .populate('employee', 'name email designation')
            .populate('shift')
            .sort({ date: 1 });
        
        res.json({
            success: true,
            count: schedules.length,
            data: schedules
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching schedules'
        });
    }
});

// Create schedule
router.post('/schedules', protect, authorize('admin'), checkSubscription, [
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('shiftId').notEmpty().withMessage('Shift ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    validate
], async (req, res) => {
    try {
        const { employeeId, shiftId, date, notes } = req.body;
        
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
        
        const shift = await Shift.findOne({
            _id: shiftId,
            company: req.user.company
        });
        
        if (!shift) {
            return res.status(404).json({
                success: false,
                message: 'Shift not found'
            });
        }
        
        const schedule = await Schedule.create({
            company: req.user.company,
            employee: employeeId,
            shift: shiftId,
            date: new Date(date),
            notes,
            status: 'scheduled'
        });
        
        res.status(201).json({
            success: true,
            message: 'Schedule created successfully',
            data: schedule
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Schedule already exists for this employee on this date'
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating schedule'
        });
    }
});

// Bulk create schedules
router.post('/schedules/bulk', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const { employeeIds, shiftId, startDate, endDate } = req.body;
        
        if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Employee IDs array is required'
            });
        }
        
        const shift = await Shift.findOne({
            _id: shiftId,
            company: req.user.company
        });
        
        if (!shift) {
            return res.status(404).json({
                success: false,
                message: 'Shift not found'
            });
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const schedules = [];
        const errors = [];
        
        for (const employeeId of employeeIds) {
            const employee = await User.findOne({
                _id: employeeId,
                company: req.user.company
            });
            
            if (!employee) {
                errors.push(`Employee ${employeeId} not found`);
                continue;
            }
            
            for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                
                if (shift.workingDays.includes(dayName)) {
                    try {
                        const schedule = await Schedule.create({
                            company: req.user.company,
                            employee: employeeId,
                            shift: shiftId,
                            date: new Date(date),
                            status: 'scheduled'
                        });
                        schedules.push(schedule);
                    } catch (err) {
                        if (err.code !== 11000) { // Ignore duplicate errors
                            errors.push(`Error scheduling ${employee.name} on ${date.toDateString()}`);
                        }
                    }
                }
            }
        }
        
        res.status(201).json({
            success: true,
            message: `${schedules.length} schedules created successfully`,
            data: schedules,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating bulk schedules'
        });
    }
});

// Delete schedule
router.delete('/schedules/:id', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const schedule = await Schedule.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }
        
        await schedule.deleteOne();
        
        res.json({
            success: true,
            message: 'Schedule deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting schedule'
        });
    }
});

module.exports = router;