const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    jobPosting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobPosting',
        default: null
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    resumeUrl: {
        type: String,
        required: true
    },
    coverLetterUrl: {
        type: String
    },
    linkedIn: {
        type: String
    },
    portfolio: {
        type: String
    },
    source: {
        type: String,
        enum: ['website', 'linkedin', 'referral', 'indeed', 'other'],
        default: 'website'
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    stage: {
        type: String,
        enum: ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected'],
        default: 'applied'
    },
    status: {
        type: String,
        enum: ['active', 'on-hold', 'rejected', 'hired', 'withdrawn'],
        default: 'active'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    skills: [{
        type: String,
        trim: true
    }],
    experience: {
        type: Number, // years
        min: 0
    },
    expectedSalary: {
        type: Number,
        min: 0
    },
    noticePeriod: {
        type: Number, // days
        min: 0
    },
    currentCompany: {
        type: String,
        trim: true
    },
    currentDesignation: {
        type: String,
        trim: true
    },
    education: [{
        degree: String,
        institution: String,
        year: Number
    }],
    interviews: [{
        round: {
            type: String,
            enum: ['screening', 'technical', 'hr', 'final', 'other']
        },
        scheduledDate: Date,
        interviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
            default: 'scheduled'
        },
        feedback: String,
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        notes: String,
        meetingLink: String
    }],
    assessments: [{
        type: {
            type: String,
            enum: ['coding', 'aptitude', 'personality', 'case-study', 'other']
        },
        assignedDate: Date,
        dueDate: Date,
        submittedDate: Date,
        score: Number,
        maxScore: Number,
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'submitted', 'evaluated'],
            default: 'pending'
        },
        feedback: String,
        evaluatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    notes: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: String,
        createdAt: {
            type: Date,
            default: Date.now
        },
        isPrivate: {
            type: Boolean,
            default: false
        }
    }],
    tags: [{
        type: String,
        trim: true
    }],
    offerDetails: {
        offeredSalary: Number,
        joiningDate: Date,
        offerLetterUrl: String,
        offerSentDate: Date,
        offerAcceptedDate: Date,
        offerRejectedDate: Date,
        rejectionReason: String
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    rejectedAt: Date,
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

applicantSchema.index({ company: 1, email: 1 });
applicantSchema.index({ company: 1, stage: 1, status: 1 });

module.exports = mongoose.model('Applicant', applicantSchema);