const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['general', 'urgent', 'event', 'policy', 'celebration'],
        default: 'general'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetAudience: {
        type: String,
        enum: ['all', 'department', 'specific'],
        default: 'all'
    },
    departments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    }],
    specificEmployees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    attachments: [{
        fileName: String,
        fileUrl: String
    }],
    publishDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: Date,
    isPinned: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'published'
    },
    reactions: [{
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        type: {
            type: String,
            enum: ['like', 'love', 'celebrate', 'insightful']
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    readBy: [{
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: Date
    }]
}, {
    timestamps: true
});

announcementSchema.index({ company: 1, publishDate: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);