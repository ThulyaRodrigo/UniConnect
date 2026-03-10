const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    societyId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Society', 
        required: true 
    },
    title: { type: String, required: true },
    category: { type: String, required: true }, 
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    ticketPrice: { type: Number, required: true, default: 0 } 
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);