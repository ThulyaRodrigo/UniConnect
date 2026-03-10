const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    eventId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event', 
        required: true 
    },
    transportId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Transport', 
        default: null // Null if the student doesn't need a bus
    },
    // For manual payment slip uploads
    paymentSlipUrl: { type: String }, 
    aiExtractedData: {
        amount: { type: Number },
        date: { type: Date },
        referenceNo: { type: String }
    },
    verificationStatus: { 
        type: String, 
        enum: ['Pending', 'Verified', 'Rejected'], 
        default: 'Pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);