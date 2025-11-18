const mongoose = require('mongoose');

const onboardingSchema = new mongoose.Schema({
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
    status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed'],
        default: 'not-started'
    },
    startDate: {
        type: Date,
        required: true
    },
    completionDate: Date,
    tasks: [{
        title: {
            type: String,
            required: true
        },
        description: String,
        category: {
            type: String,
            enum: ['documentation', 'equipment', 'training', 'introduction', 'system-access', 'other'],
            default: 'other'
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        dueDate: Date,
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed', 'skipped'],
            default: 'pending'
        },
        completedAt: Date,
        notes: String
    }],
    documents: [{
        document: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document'
        },
        submitted: {
            type: Boolean,
            default: false
        },
        submittedAt: Date
    }],
    equipment: [{
        name: String,
        serialNumber: String,
        assignedDate: Date,
        returnDate: Date,
        status: {
            type: String,
            enum: ['assigned', 'returned'],
            default: 'assigned'
        }
    }],
    buddy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    notes: {
        type: String,
        trim: true
    },
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comments: String,
        submittedAt: Date
    }
}, {
    timestamps: true
});

onboardingSchema.index({ company: 1, employee: 1 });

module.exports = mongoose.model('Onboarding', onboardingSchema);