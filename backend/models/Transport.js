const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
    eventId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event', 
        required: true 
    },
    route: { type: String, required: true }, 
    totalSeats: { type: Number, required: true },
    availableSeats: { type: Number, required: true } 
}, { timestamps: true });

module.exports = mongoose.model('Transport', transportSchema);