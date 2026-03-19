const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: String, required: true }, // Storing as string "YYYY-MM-DD" for easy frontend rendering
    time: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, default: 0 },
    capacity: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }, // Cloudinary URL
    society: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Society', 
        required: true 
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);