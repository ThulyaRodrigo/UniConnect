const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
    route: { 
        type: String, 
        required: true 
    },
    totalCapacity: { 
        type: Number, 
        required: true 
    },
    remainingSeats: { 
        type: Number, 
        required: true 
    },
    event: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Transport', transportSchema);