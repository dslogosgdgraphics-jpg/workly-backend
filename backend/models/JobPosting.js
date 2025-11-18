const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema({
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
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    employmentType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary'],
        required: true
    },
    workMode: {
        type: String,
        enum: ['remote', 'on-site', 'hybrid'],
        default: 'on-site'
    },
    experienceLevel: {
        type: String,
        enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    responsibilities: [{
        type: String
    }],
    requirements: [{
        type: String
    }],
    skills: [{
        type: String,
        trim: true
    }],
    salaryRange: {
        min: {
            type: Number,
            min: 0
        },
        max: {
            type: Number,
            min: 0
        },
        currency: {
            type: String,
            default: 'PKR'
        }
    },
    benefits: [{
        type: String
    }],
    numberOfOpenings: {
        type: Number,
        default: 1,
        min: 1
    },
    hiringManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['draft', 'open', 'closed', 'on-hold'],
        default: 'draft'
    },
    applicationDeadline: {
        type: Date
    },
    publishedDate: {
        type: Date
    },
    closedDate: {
        type: Date
    },
    applicationCount: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    slug: {
        type: String,
        unique: true,
        sparse: true
    },
    screeningQuestions: [{
        question: String,
        type: {
            type: String,
            enum: ['text', 'yes-no', 'multiple-choice'],
            default: 'text'
        },
        options: [String],
        required: {
            type: Boolean,
            default: false
        }
    }]
}, {
    timestamps: true
});

// Generate slug before saving
jobPostingSchema.pre('save', function(next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            + '-' + Date.now();
    }
    next();
});

jobPostingSchema.index({ company: 1, status: 1 });
jobPostingSchema.index({ slug: 1 });

module.exports = mongoose.model('JobPosting', jobPostingSchema);