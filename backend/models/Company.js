const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Company email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    logo: {
        type: String,
        default: null
    },
    subscriptionPlan: {
        type: String,
        enum: ['trial', 'basic', 'pro', 'enterprise'],
        default: 'trial'
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'cancelled'],
        default: 'active'
    },
    subscriptionStartDate: {
        type: Date,
        default: Date.now
    },
    subscriptionEndDate: {
        type: Date,
        default: function() {
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
    },
    maxEmployees: {
        type: Number,
        default: 999999
    },
    settings: {
        workingDaysPerWeek: {
            type: Number,
            default: 6
        },
        workingHoursPerDay: {
            type: Number,
            default: 8
        },
        currency: {
            type: String,
            default: 'PKR'
        },
        timezone: {
            type: String,
            default: 'Asia/Karachi'
        }
    }
}, {
    timestamps: true
});

companySchema.index({ email: 1 });

module.exports = mongoose.model('Company', companySchema);