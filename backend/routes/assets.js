const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Asset = require('../models/Asset');
const User = require('../models/User');
const { protect, authorize, checkSubscription } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Get all assets
router.get('/', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const { status, category, assignedTo } = req.query;
        
        let query = { company: req.user.company };
        
        if (status) query.status = status;
        if (category) query.category = category;
        if (assignedTo) query.assignedTo = assignedTo;
        
        const assets = await Asset.find(query)
            .populate('assignedTo', 'name email designation')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: assets.length,
            data: assets
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching assets'
        });
    }
});

// Create asset
router.post('/', protect, authorize('admin'), checkSubscription, [
    body('name').notEmpty().withMessage('Asset name is required'),
    body('category').isIn(['laptop', 'mobile', 'tablet', 'accessories', 'furniture', 'vehicle', 'other']).withMessage('Invalid category'),
    validate
], async (req, res) => {
    try {
        const asset = await Asset.create({
            company: req.user.company,
            ...req.body
        });
        
        res.status(201).json({
            success: true,
            message: 'Asset created successfully',
            data: asset
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating asset'
        });
    }
});

// Assign asset
router.post('/:id/assign', protect, authorize('admin'), checkSubscription, [
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    validate
], async (req, res) => {
    try {
        const { employeeId, notes } = req.body;
        
        const asset = await Asset.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!asset) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }
        
        if (asset.status === 'assigned') {
            return res.status(400).json({
                success: false,
                message: 'Asset is already assigned'
            });
        }
        
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
        
        asset.assignedTo = employeeId;
        asset.assignedDate = new Date();
        asset.status = 'assigned';
        
        asset.history.push({
            action: 'assigned',
            employee: employeeId,
            date: new Date(),
            notes
        });
        
        await asset.save();
        
        res.json({
            success: true,
            message: 'Asset assigned successfully',
            data: asset
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error assigning asset'
        });
    }
});

// Return asset
router.post('/:id/return', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const { notes, condition } = req.body;
        
        const asset = await Asset.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!asset) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }
        
        if (asset.status !== 'assigned') {
            return res.status(400).json({
                success: false,
                message: 'Asset is not currently assigned'
            });
        }
        
        const previousEmployee = asset.assignedTo;
        
        asset.assignedTo = null;
        asset.assignedDate = null;
        asset.status = 'available';
        
        if (condition) {
            asset.condition = condition;
        }
        
        asset.history.push({
            action: 'returned',
            employee: previousEmployee,
            date: new Date(),
            notes
        });
        
        await asset.save();
        
        res.json({
            success: true,
            message: 'Asset returned successfully',
            data: asset
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error returning asset'
        });
    }
});

// Update asset
router.put('/:id', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const asset = await Asset.findOneAndUpdate(
            { _id: req.params.id, company: req.user.company },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!asset) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Asset updated successfully',
            data: asset
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating asset'
        });
    }
});

// Delete asset
router.delete('/:id', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const asset = await Asset.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!asset) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }
        
        if (asset.status === 'assigned') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete assigned asset. Please return it first.'
            });
        }
        
        await asset.deleteOne();
        
        res.json({
            success: true,
            message: 'Asset deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting asset'
        });
    }
});

module.exports = router;