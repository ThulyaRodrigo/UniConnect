const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversation: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Conversation', 
        required: true 
    },
    senderType: { 
        type: String, 
        enum: ['Student', 'Society'], 
        required: true 
    },
    // 'text' | 'image'
    messageType: {
        type: String,
        enum: ['text', 'image'],
        default: 'text'
    },
    text: { 
        type: String,
        default: ''
    },
    // Cloudinary URL for image messages
    imageUrl: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// PERFORMANCE BOOST: Index by conversation so fetching chat history is fast
messageSchema.index({ conversation: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
