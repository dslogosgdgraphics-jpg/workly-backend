const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
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
    month: {
        type: String,
        required: true,
        match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format']
    },
    totalDays: {
        type: Number,
        required: true
    },
    daysPresent: {
        type: Number,
        required: true,
        default: 0
    },
    basicSalary: {
        type: Number,
        required: true
    },
    overtime: {
        type: Number,
        default: 0
    },
    bonuses: {
        type: Number,
        default: 0
    },
    deductions: {
        type: Number,
        default: 0
    },
    totalSalary: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled'],
        default: 'pending'
    },
    paidDate: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

payrollSchema.index({ company: 1, employee: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);