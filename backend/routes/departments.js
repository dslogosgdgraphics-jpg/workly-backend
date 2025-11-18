const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Department = require('../models/Department');
const User = require('../models/User');
const { protect, authorize, checkSubscription } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Get all departments
router.get('/', protect, checkSubscription, async (req, res) => {
    try {
        const departments = await Department.find({ 
            company: req.user.company 
        })
        .populate('head', 'name email designation')
        .populate('parentDepartment', 'name')
        .sort({ name: 1 });
        
        res.json({
            success: true,
            count: departments.length,
            data: departments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching departments'
        });
    }
});

// Get department hierarchy
router.get('/hierarchy', protect, checkSubscription, async (req, res) => {
    try {
        const departments = await Department.find({ 
            company: req.user.company 
        })
        .populate('head', 'name email')
        .lean();
        
        // Build tree structure
        const buildTree = (parentId = null) => {
            return departments
                .filter(dept => {
                    const parent = dept.parentDepartment?.toString();
                    return parentId === null ? !parent : parent === parentId;
                })
                .map(dept => ({
                    ...dept,
                    children: buildTree(dept._id.toString())
                }));
        };
        
        const hierarchy = buildTree();
        
        res.json({
            success: true,
            data: hierarchy
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching department hierarchy'
        });
    }
});

// Create department
router.post('/', protect, authorize('admin'), checkSubscription, [
    body('name').notEmpty().withMessage('Department name is required'),
    body('code').notEmpty().withMessage('Department code is required'),
    validate
], async (req, res) => {
    try {
        const { name, code, description, head, parentDepartment, budget } = req.body;
        
        const existing = await Department.findOne({
            company: req.user.company,
            code: code.toUpperCase()
        });
        
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Department code already exists'
            });
        }
        
        const department = await Department.create({
            company: req.user.company,
            name,
            code: code.toUpperCase(),
            description,
            head,
            parentDepartment,
            budget
        });
        
        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: department
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating department'
        });
    }
});

// Update department
router.put('/:id', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const department = await Department.findOneAndUpdate(
            { _id: req.params.id, company: req.user.company },
            req.body,
            { new: true, runValidators: true }
        )
        .populate('head', 'name email');
        
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Department updated successfully',
            data: department
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating department'
        });
    }
});

// Delete department
router.delete('/:id', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const department = await Department.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }
        
        // Check if department has employees
        const employeeCount = await User.countDocuments({
            company: req.user.company,
            department: req.params.id
        });
        
        if (employeeCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete department with ${employeeCount} employees. Please reassign them first.`
            });
        }
        
        await department.deleteOne();
        
        res.json({
            success: true,
            message: 'Department deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting department'
        });
    }
});

module.exports = router;