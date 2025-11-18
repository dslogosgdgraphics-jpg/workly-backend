const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: [
            'contract',
            'id-card',
            'certificate',
            'tax-form',
            'resume',
            'performance-review',
            'policy',
            'other'
        ],
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiryDate: {
        type: Date,
        default: null
    },
    isConfidential: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['active', 'archived', 'expired'],
        default: 'active'
    },
    version: {
        type: Number,
        default: 1
    },
    acknowledgments: [{
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        acknowledgedAt: Date,
        signature: String
    }]
}, {
    timestamps: true
});

documentSchema.index({ company: 1, employee: 1, category: 1 });

module.exports = mongoose.model('Document', documentSchema);