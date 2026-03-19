const mongoose = require('mongoose');

const masterRouteSchema = new mongoose.Schema({
    destination: { 
        type: String, 
        required: [true, 'Please add a destination'] 
    },
    waypoints: { 
        type: String, 
        default: '' 
    },
    capacity: { 
        type: Number, 
        required: [true, 'Please add standard bus capacity'] 
    },
    status: { 
        type: String, 
        enum: ['Active', 'Inactive'], 
        default: 'Active' 
    }
}, { timestamps: true });

module.exports = mongoose.model('MasterRoute', masterRouteSchema);