const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    event: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event', 
        required: true 
    },
    primaryBuyer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    ticketCount: { 
        type: Number, 
        required: true,
        min: 1
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentSlipUrl: { 
        type: String, 
        default: null // Will be null for free events
    },
    status: {
        type: String,
        enum: ['Pending Verification', 'Confirmed', 'Rejected'],
        default: 'Pending Verification'
    },
    // The specific details for each ticket booked in this transaction
    attendees: [{
        studentId: { type: String, required: true },
        name: { type: String, required: true },
        transportRoute: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Transport',
            default: null 
        },
        checkedIn: { 
            type: Boolean, 
            default: false 
        }
    }],
    aiExtractionData: {
        amountFound: { type: Number, default: null },
        dateFound: { type: String, default: null },
        refFound: { type: String, default: null },
        matchConfidence: { type: String, default: null },
        suggestedRejectionReason: { type: String, default: null } 
    },
    rejectionReason: {
        type: String,
        default: null
    },
    verifiedAt: {
        type: Date,
        default: null 
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);