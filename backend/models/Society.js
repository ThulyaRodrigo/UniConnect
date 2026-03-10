const mongoose = require('mongoose');

const societySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true }, 
    description: { type: String },
    // This array stores the current board members
    currentBoard: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }]
}, { timestamps: true });

module.exports = mongoose.model('Society', societySchema);