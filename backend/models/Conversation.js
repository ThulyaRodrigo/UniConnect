const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    society: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Society', 
        required: true 
    },
    lastMessage: { 
        type: String, 
        default: '' 
    }
}, { timestamps: true });

// PERFORMANCE BOOST: Ensure a student and society only ever have ONE conversation room
conversationSchema.index({ student: 1, society: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);
