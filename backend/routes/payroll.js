const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Payroll = require('../models/Payroll');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const { protect, authorize, checkSubscription } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

router.get('/', protect, checkSubscription, async (req, res) => {
    try {
        const { month, employeeId } = req.query;
        
        let query = { company: req.user.company };
        
        if (req.user.role === 'employee') {
            query.employee = req.user._id;
        } else if (employeeId) {
            query.employee = employeeId;
        }
        
        if (month) {
            query.month = month;
        }
        
        const payroll = await Payroll.find(query)
            .populate('employee', 'name email designation salary')
            .sort({ month: -1 });
        
        res.json({
            success: true,
            count: payroll.length,
            data: payroll
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payroll records'
        });
    }
});

router.get('/:id', protect, checkSubscription, async (req, res) => {
    try {
        const payroll = await Payroll.findOne({
            _id: req.params.id,
            company: req.user.company
        }).populate('employee', 'name email designation salary');
        
        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: 'Payroll record not found'
            });
        }
        
        if (req.user.role === 'employee' && payroll.employee._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this payroll'
            });
        }
        
        res.json({
            success: true,
            data: payroll
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payroll record'
        });
    }
});

router.post('/generate', protect, authorize('admin'), checkSubscription, [
    body('month').matches(/^\d{4}-\d{2}$/).withMessage('Month must be in YYYY-MM format'),
    validate
], async (req, res) => {
    try {
        const { month } = req.body;
        const [year, monthNum] = month.split('-').map(Number);
        
        const employees = await User.find({
            company: req.user.company,
            role: 'employee',
            status: 'active'
        });
        
        if (employees.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No active employees found'
            });
        }
        
        const totalDays = new Date(year, monthNum, 0).getDate();
        
        const payrollRecords = [];
        const errors = [];
        
        for (const employee of employees) {
            try {
                const existing = await Payroll.findOne({
                    company: req.user.company,
                    employee: employee._id,
                    month
                });
                
                if (existing) {
                    errors.push(`Payroll already exists for ${employee.name}`);
                    continue;
                }
                
                const startDate = new Date(year, monthNum - 1, 1);
                const endDate = new Date(year, monthNum, 0);
                
                const attendance = await Attendance.find({
                    company: req.user.company,
                    employee: employee._id,
                    date: { $gte: startDate, $lte: endDate },
                    status: { $in: ['present', 'late'] }
                });
                
                const daysPresent = attendance.length;
                
                const unpaidLeaves = await Leave.find({
                    company: req.user.company,
                    employee: employee._id,
                    type: 'unpaid',
                    status: 'approved',
                    startDate: { $gte: startDate, $lte: endDate }
                });
                
                let unpaidDays = 0;
                unpaidLeaves.forEach(leave => {
                    const start = new Date(leave.startDate);
                    const end = new Date(leave.endDate);
                    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                    unpaidDays += days;
                });
                
                const dailyRate = employee.salary / totalDays;
                const earnedSalary = dailyRate * daysPresent;
                const deductions = dailyRate * unpaidDays;
                const totalSalary = Math.round(earnedSalary - deductions);
                
                const payroll = await Payroll.create({
                    company: req.user.company,
                    employee: employee._id,
                    month,
                    totalDays,
                    daysPresent,
                    basicSalary: employee.salary,
                    overtime: 0,
                    bonuses: 0,
                    deductions: Math.round(deductions),
                    totalSalary,
                    status: 'pending'
                });
                
                payrollRecords.push(payroll);
            } catch (err) {
                errors.push(`Error processing ${employee.name}: ${err.message}`);
            }
        }
        
        res.status(201).json({
            success: true,
            message: `Payroll generated for ${payrollRecords.length} employees`,
            data: payrollRecords,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error generating payroll'
        });
    }
});

router.put('/:id', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        let payroll = await Payroll.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: 'Payroll record not found'
            });
        }
        
        const { overtime, bonuses, deductions, notes } = req.body;
        
        if (overtime !== undefined) payroll.overtime = overtime;
        if (bonuses !== undefined) payroll.bonuses = bonuses;
        if (deductions !== undefined) payroll.deductions = deductions;
        if (notes !== undefined) payroll.notes = notes;
        
        const dailyRate = payroll.basicSalary / payroll.totalDays;
        const earnedSalary = dailyRate * payroll.daysPresent;
        payroll.totalSalary = Math.round(
            earnedSalary + payroll.overtime + payroll.bonuses - payroll.deductions
        );
        
        await payroll.save();
        
        res.json({
            success: true,
            message: 'Payroll updated successfully',
            data: payroll
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating payroll'
        });
    }
});

router.put('/:id/status', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['pending', 'paid', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        
        const payroll = await Payroll.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: 'Payroll record not found'
            });
        }
        
        payroll.status = status;
        if (status === 'paid') {
            payroll.paidDate = new Date();
        }
        
        await payroll.save();
        
        res.json({
            success: true,
            message: `Payroll marked as ${status}`,
            data: payroll
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating payroll status'
        });
    }
});

router.delete('/:id', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const payroll = await Payroll.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: 'Payroll record not found'
            });
        }
        
        await payroll.deleteOne();
        
        res.json({
            success: true,
            message: 'Payroll record deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting payroll record'
        });
    }
});

module.exports = router;