const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['SuperAdmin', 'SocietyAdmin', 'Student'], 
        default: 'Student' 
    },
    // If the user is a Society Admin, this links them to their society
    societyId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Society', 
        default: null 
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);