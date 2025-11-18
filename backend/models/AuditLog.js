const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'create',
            'update',
            'delete',
            'login',
            'logout',
            'export',
            'approve',
            'reject',
            'assign',
            'unassign'
        ]
    },
    resource: {
        type: String,
        required: true,
        enum: [
            'user',
            'attendance',
            'leave',
            'payroll',
            'document',
            'expense',
            'performance',
            'department',
            'announcement',
            'asset',
            'shift',
            'company'
        ]
    },
    resourceId: mongoose.Schema.Types.ObjectId,
    changes: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    metadata: mongoose.Schema.Types.Mixed
}, {
    timestamps: true
});

auditLogSchema.index({ company: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, action: 1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

module.exports = mongoose.model('AuditLog', auditLogSchema);