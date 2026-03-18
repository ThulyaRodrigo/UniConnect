const mongoose = require('mongoose');

const handoverLogSchema = new mongoose.Schema({
    society: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Society', 
        required: true 
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    action: { 
        type: String, 
        required: true 
    },
    performedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('HandoverLog', handoverLogSchema);