const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    parentDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        default: null
    },
    employeeCount: {
        type: Number,
        default: 0
    },
    budget: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

departmentSchema.index({ company: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);