const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['travel', 'food', 'accommodation', 'transport', 'supplies', 'training', 'other'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'PKR'
    },
    date: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    receipts: [{
        fileName: String,
        fileUrl: String
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'reimbursed'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,
    rejectionReason: String,
    reimbursedAt: Date,
    notes: String
}, {
    timestamps: true
});

expenseSchema.index({ company: 1, employee: 1, status: 1 });

module.exports = mongoose.model('Expense', expenseSchema);