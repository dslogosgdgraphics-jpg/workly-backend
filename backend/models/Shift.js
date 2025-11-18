const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
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
    startTime: {
        type: String,
        required: true,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format']
    },
    endTime: {
        type: String,
        required: true,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format']
    },
    breakDuration: {
        type: Number,
        default: 60,
        min: 0
    },
    workingDays: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    color: {
        type: String,
        default: '#3B82F6'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const scheduleSchema = new mongoose.Schema({
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
    shift: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shift',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    notes: String,
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'missed', 'cancelled'],
        default: 'scheduled'
    }
}, {
    timestamps: true
});

scheduleSchema.index({ company: 1, employee: 1, date: 1 }, { unique: true });

const Shift = mongoose.model('Shift', shiftSchema);
const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = { Shift, Schedule };