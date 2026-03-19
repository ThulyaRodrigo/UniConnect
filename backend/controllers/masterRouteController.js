const MasterRoute = require('../models/MasterRoute');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// SUPER ADMIN FUNCTIONS (MasterRoutes.jsx)

// @desc    Create a Master Route
// @route   POST /api/routes
// @access  Private (SuperAdmin)
exports.createRoute = async (req, res) => {
    try {
        const route = await MasterRoute.create(req.body);
        res.status(201).json({ success: true, data: route });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all Master Routes
// @route   GET /api/routes
// @access  Public (Used by Students to book, and Admins to view)
exports.getRoutes = async (req, res) => {
    try {
        const routes = await MasterRoute.find();
        res.status(200).json({ success: true, data: routes });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a Master Route
// @route   PUT /api/routes/:id
// @access  Private (SuperAdmin)
exports.updateRoute = async (req, res) => {
    try {
        const route = await MasterRoute.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!route) return res.status(404).json({ message: 'Route not found' });
        res.status(200).json({ success: true, data: route });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a Master Route
// @route   DELETE /api/routes/:id
// @access  Private (SuperAdmin)
exports.deleteRoute = async (req, res) => {
    try {
        const route = await MasterRoute.findByIdAndDelete(req.params.id);
        if (!route) return res.status(404).json({ message: 'Route not found' });
        res.status(200).json({ success: true, message: 'Route deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};