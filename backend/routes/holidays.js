const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Holiday = require('../models/Holiday');
const { protect, authorize, checkSubscription } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Get all holidays
router.get('/', protect, checkSubscription, async (req, res) => {
    try {
        const { year, type } = req.query;
        
        let query = { 
            company: req.user.company,
            isActive: true
        };
        
        if (year) {
            const startDate = new Date(`${year}-01-01`);
            const endDate = new Date(`${year}-12-31`);
            query.date = { $gte: startDate, $lte: endDate };
        }
        
        if (type) query.type = type;
        
        const holidays = await Holiday.find(query)
            .populate('departments', 'name')
            .sort({ date: 1 });
        
        res.json({
            success: true,
            count: holidays.length,
            data: holidays
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching holidays'
        });
    }
});

// Create holiday
router.post('/', protect, authorize('admin'), checkSubscription, [
    body('name').notEmpty().withMessage('Holiday name is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    validate
], async (req, res) => {
    try {
        const holiday = await Holiday.create({
            company: req.user.company,
            ...req.body
        });
        
        res.status(201).json({
            success: true,
            message: 'Holiday created successfully',
            data: holiday
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating holiday'
        });
    }
});

// Update holiday
router.put('/:id', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const holiday = await Holiday.findOneAndUpdate(
            { _id: req.params.id, company: req.user.company },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!holiday) {
            return res.status(404).json({
                success: false,
                message: 'Holiday not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Holiday updated successfully',
            data: holiday
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating holiday'
        });
    }
});

// Delete holiday
router.delete('/:id', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const holiday = await Holiday.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!holiday) {
            return res.status(404).json({
                success: false,
                message: 'Holiday not found'
            });
        }
        
        await holiday.deleteOne();
        
        res.json({
            success: true,
            message: 'Holiday deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting holiday'
        });
    }
});

module.exports = router;