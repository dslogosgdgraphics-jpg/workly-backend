const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'leave-request',
            'leave-approved',
            'leave-rejected',
            'expense-submitted',
            'expense-approved',
            'payroll-generated',
            'document-uploaded',
            'announcement',
            'performance-review',
            'birthday',
            'work-anniversary',
            'task-assigned',
            'system'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    link: String,
    icon: String,
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    relatedModel: String,
    relatedId: mongoose.Schema.Types.ObjectId
}, {
    timestamps: true
});

notificationSchema.index({ company: 1, recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

module.exports = mongoose.model('Notification', notificationSchema);