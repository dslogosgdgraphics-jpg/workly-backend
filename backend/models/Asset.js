const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
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
    category: {
        type: String,
        enum: ['laptop', 'mobile', 'tablet', 'accessories', 'furniture', 'vehicle', 'other'],
        required: true
    },
    brand: String,
    model: String,
    serialNumber: {
        type: String,
        trim: true
    },
    purchaseDate: Date,
    purchasePrice: {
        type: Number,
        min: 0
    },
    warranty: {
        expiryDate: Date,
        provider: String
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    assignedDate: Date,
    status: {
        type: String,
        enum: ['available', 'assigned', 'maintenance', 'retired'],
        default: 'available'
    },
    condition: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor'],
        default: 'excellent'
    },
    location: String,
    notes: String,
    history: [{
        action: {
            type: String,
            enum: ['assigned', 'returned', 'maintenance', 'retired']
        },
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: Date,
        notes: String
    }]
}, {
    timestamps: true
});

assetSchema.index({ company: 1, serialNumber: 1 });

module.exports = mongoose.model('Asset', assetSchema);