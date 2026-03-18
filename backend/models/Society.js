const mongoose = require('mongoose');

const societySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a society name'],
        unique: true,
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Technology', 'Musical', 'Cultural', 'Sport', 'Religion']
    },
    description: {
        type: String,
        default: ''
    },
    logo: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    bankAccounts: [{
        bankName: String,
        accNo: String,
        accName: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    board: [{
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true
        },
        position: { 
            type: String, 
            required: true,
            enum: ['President', 'Vice President', 'Secretary', 'Treasurer', 'Editor'] 
        },
        assignedAt: {
            type: Date,
            default: Date.now
        }
    }],
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Society', societySchema);