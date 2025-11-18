const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body } = require('express-validator');
const Expense = require('../models/Expense');
const { protect, authorize, checkSubscription } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { uploadFile } = require('../utils/fileUpload');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|jpg|jpeg|png/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        if (extname) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and images allowed'));
        }
    }
});

// Get all expenses
router.get('/', protect, checkSubscription, async (req, res) => {
    try {
        const { status, employeeId, startDate, endDate } = req.query;
        
        let query = { company: req.user.company };
        
        if (req.user.role === 'employee') {
            query.employee = req.user._id;
        } else if (employeeId) {
            query.employee = employeeId;
        }
        
        if (status) query.status = status;
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const expenses = await Expense.find(query)
            .populate('employee', 'name email designation')
            .populate('approvedBy', 'name')
            .sort({ date: -1 });
        
        res.json({
            success: true,
            count: expenses.length,
            data: expenses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching expenses'
        });
    }
});

// Submit expense
router.post('/', protect, checkSubscription, upload.array('receipts', 5), [
    body('title').notEmpty().withMessage('Title is required'),
    body('category').isIn(['travel', 'food', 'accommodation', 'transport', 'supplies', 'training', 'other']).withMessage('Invalid category'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('date').isISO8601().withMessage('Valid date is required'),
    validate
], async (req, res) => {
    try {
        const { title, category, amount, date, description } = req.body;
        
        const receipts = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const fileUrl = await uploadFile(file);
                receipts.push({
                    fileName: file.originalname,
                    fileUrl
                });
            }
        }
        
        const expense = await Expense.create({
            company: req.user.company,
            employee: req.user._id,
            title,
            category,
            amount,
            date,
            description,
            receipts,
            status: 'pending'
        });
        
        res.status(201).json({
            success: true,
            message: 'Expense submitted successfully',
            data: expense
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error submitting expense'
        });
    }
});

// Approve expense
router.put('/:id/approve', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }
        
        if (expense.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Expense already reviewed'
            });
        }
        
        expense.status = 'approved';
        expense.approvedBy = req.user._id;
        expense.approvedAt = new Date();
        expense.notes = req.body.notes || '';
        
        await expense.save();
        
        res.json({
            success: true,
            message: 'Expense approved',
            data: expense
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error approving expense'
        });
    }
});

// Reject expense
router.put('/:id/reject', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }
        
        expense.status = 'rejected';
        expense.approvedBy = req.user._id;
        expense.approvedAt = new Date();
        expense.rejectionReason = req.body.reason || '';
        
        await expense.save();
        
        res.json({
            success: true,
            message: 'Expense rejected',
            data: expense
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error rejecting expense'
        });
    }
});

// Mark as reimbursed
router.put('/:id/reimburse', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            company: req.user.company,
            status: 'approved'
        });
        
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Approved expense not found'
            });
        }
        
        expense.status = 'reimbursed';
        expense.reimbursedAt = new Date();
        
        await expense.save();
        
        res.json({
            success: true,
            message: 'Expense marked as reimbursed',
            data: expense
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating expense'
        });
    }
});

module.exports = router;