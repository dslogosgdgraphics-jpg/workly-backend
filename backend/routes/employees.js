const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const User = require('../models/User');
const { protect, authorize, checkSubscription } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

router.get('/', protect, checkSubscription, async (req, res) => {
    try {
        const employees = await User.find({ 
            company: req.user.company,
            ...(req.user.role === 'employee' && { _id: req.user._id })
        }).select('-password').sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employees'
        });
    }
});

router.get('/:id', protect, checkSubscription, async (req, res) => {
    try {
        const employee = await User.findOne({
            _id: req.params.id,
            company: req.user.company
        }).select('-password');
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        
        res.json({
            success: true,
            data: employee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employee'
        });
    }
});

router.post('/', protect, authorize('admin'), checkSubscription, [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('designation').notEmpty().withMessage('Designation is required'),
    body('salary').isNumeric().withMessage('Valid salary is required'),
    validate
], async (req, res) => {
    try {
        const existingUser = await User.findOne({
            email: req.body.email.toLowerCase(),
            company: req.user.company
        });
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Employee with this email already exists'
            });
        }
        
        const employee = await User.create({
            ...req.body,
            company: req.user.company,
            email: req.body.email.toLowerCase(),
            role: req.body.role || 'employee'
        });
        
        const employeeData = employee.toObject();
        delete employeeData.password;
        
        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: employeeData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating employee'
        });
    }
});

router.put('/:id', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        let employee = await User.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        
        delete req.body.password;
        delete req.body.company;
        
        employee = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');
        
        res.json({
            success: true,
            message: 'Employee updated successfully',
            data: employee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating employee'
        });
    }
});

router.delete('/:id', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const employee = await User.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        
        if (employee._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }
        
        await employee.deleteOne();
        
        const Attendance = require('../models/Attendance');
        const Leave = require('../models/Leave');
        const Payroll = require('../models/Payroll');
        
        await Attendance.deleteMany({ employee: req.params.id });
        await Leave.deleteMany({ employee: req.params.id });
        await Payroll.deleteMany({ employee: req.params.id });
        
        res.json({
            success: true,
            message: 'Employee and related data deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting employee'
        });
    }
});

module.exports = router;