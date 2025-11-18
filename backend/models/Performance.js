const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
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
    reviewPeriod: {
        type: String,
        required: true,
        match: [/^\d{4}-Q[1-4]$|^\d{4}-\d{2}$/, 'Format: YYYY-MM or YYYY-Q1']
    },
    reviewType: {
        type: String,
        enum: ['quarterly', 'annual', 'probation', 'project', 'okr'],
        required: true
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'in-progress', 'submitted', 'completed'],
        default: 'draft'
    },
    
    // ENHANCED: OKRs Section
    objectives: [{
        title: {
            type: String,
            required: true
        },
        description: String,
        category: {
            type: String,
            enum: ['individual', 'team', 'company'],
            default: 'individual'
        },
        startDate: Date,
        targetDate: Date,
        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        weight: {
            type: Number,
            min: 0,
            max: 100,
            default: 25
        },
        status: {
            type: String,
            enum: ['not-started', 'on-track', 'at-risk', 'delayed', 'completed', 'cancelled'],
            default: 'not-started'
        },
        keyResults: [{
            description: {
                type: String,
                required: true
            },
            metric: String,
            startValue: Number,
            targetValue: Number,
            currentValue: Number,
            unit: String, // e.g., '%', 'count', 'hours', 'revenue'
            progress: {
                type: Number,
                min: 0,
                max: 100,
                default: 0
            },
            status: {
                type: String,
                enum: ['not-started', 'on-track', 'at-risk', 'completed'],
                default: 'not-started'
            },
            updates: [{
                value: Number,
                notes: String,
                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                updatedAt: {
                    type: Date,
                    default: Date.now
                }
            }]
        }],
        milestones: [{
            title: String,
            dueDate: Date,
            completed: {
                type: Boolean,
                default: false
            },
            completedAt: Date
        }],
        alignedWith: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Performance' // Link to parent/team OKR
        }
    }],
    
    // Legacy goals (keeping for backward compatibility)
    goals: [{
        title: {
            type: String,
            required: true
        },
        description: String,
        targetDate: Date,
        status: {
            type: String,
            enum: ['not-started', 'in-progress', 'completed', 'cancelled'],
            default: 'not-started'
        },
        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        weight: {
            type: Number,
            min: 0,
            max: 100,
            default: 20
        }
    }],
    
    // Performance ratings
    ratings: {
        quality: {
            type: Number,
            min: 1,
            max: 5
        },
        productivity: {
            type: Number,
            min: 1,
            max: 5
        },
        communication: {
            type: Number,
            min: 1,
            max: 5
        },
        teamwork: {
            type: Number,
            min: 1,
            max: 5
        },
        leadership: {
            type: Number,
            min: 1,
            max: 5
        },
        initiative: {
            type: Number,
            min: 1,
            max: 5
        },
        problemSolving: {
            type: Number,
            min: 1,
            max: 5
        },
        timeManagement: {
            type: Number,
            min: 1,
            max: 5
        }
    },
    overallRating: {
        type: Number,
        min: 1,
        max: 5
    },
    
    // Competencies
    competencies: [{
        name: String,
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comments: String
    }],
    
    strengths: {
        type: String,
        trim: true
    },
    areasOfImprovement: {
        type: String,
        trim: true
    },
    managerComments: {
        type: String,
        trim: true
    },
    employeeComments: {
        type: String,
        trim: true
    },
    
    actionItems: [{
        item: String,
        dueDate: Date,
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed'],
            default: 'pending'
        },
        completedAt: Date
    }],
    
    // Development plan
    developmentPlan: [{
        area: String,
        action: String,
        timeline: String,
        resources: String,
        support: String
    }],
    
    submittedAt: Date,
    completedAt: Date,
    
    // Sign-offs
    employeeSignature: {
        acknowledged: {
            type: Boolean,
            default: false
        },
        acknowledgedAt: Date,
        signature: String,
        comments: String
    },
    managerSignature: {
        approved: {
            type: Boolean,
            default: false
        },
        approvedAt: Date,
        signature: String
    }
}, {
    timestamps: true
});

performanceSchema.index({ company: 1, employee: 1, reviewPeriod: 1 });

module.exports = mongoose.model('Performance', performanceSchema);