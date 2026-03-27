const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Please add a name'] 
    },
    studentId: {
        type: String,
        unique: true,
        sparse: true // Allows nulls to not clash for non-students
    },
    email: { 
        type: String, 
        required: [true, 'Please add an email'], 
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: { 
        type: String, 
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // Automatically hide password in queries unless explicitly requested
    },
    profilePic: {
        type: String,
        default: ''
    },
    phone: { 
        type: String, 
        default: '' 
    },
    bio: { 
        type: String, 
        default: '' 
    },
    isActive: {
        type: Boolean,
        default: true
    },
    role: { 
        type: String, 
        enum: ['Student', 'SocietyAdmin', 'SuperAdmin'], 
        default: 'Student' 
    },
    // Array of societies this user has admin rights for (Context Switcher logic)
    adminSocieties: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Society' 
    }],
    leadershipHistory: [{
        society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society' },
        societyName: { type: String, required: true }, 
        role: { type: String, required: true }, 
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date, default: null },
        status: { type: String, enum: ['Active', 'Completed', 'Revoked'], default: 'Active' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);