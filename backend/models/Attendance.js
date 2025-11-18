const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        required: true
    },
    checkInTime: {
        type: String,
        default: null
    },
    checkOutTime: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'half-day'],
        default: 'present'
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

attendanceSchema.index({ company: 1, employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);