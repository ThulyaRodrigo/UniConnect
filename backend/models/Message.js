const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversation: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Conversation', 
        required: true 
    },
    // This tells us if the message goes on the LEFT or RIGHT side of the UI
    senderType: { 
        type: String, 
        enum: ['Student', 'Society'], 
        required: true 
    },
    text: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

// PERFORMANCE BOOST: Index by conversation so fetching chat history is fast
messageSchema.index({ conversation: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
