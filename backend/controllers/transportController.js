const Transport = require('../models/Transport');
const Event = require('../models/Event');

// @desc    Create a new transport route for an event
// @route   POST /api/transports
// @access  Private (SocietyAdmin)
exports.createTransport = async (req, res) => {
    try {
        const { route, totalCapacity, eventId } = req.body;

        if (!route || !totalCapacity || !eventId) {
            return res.status(400).json({ message: 'Please provide route, capacity, and event ID' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const transport = await Transport.create({
            route,
            totalCapacity,
            remainingSeats: totalCapacity, // Initially, remaining seats = total capacity
            event: eventId
        });

        res.status(201).json({ success: true, data: transport });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all transport routes for a specific event
// @route   GET /api/transports/event/:eventId
// @access  Public (Used by Students on the Booking Page)
exports.getTransportsForEvent = async (req, res) => {
    try {
        const transports = await Transport.find({ event: req.params.eventId });
        res.status(200).json({ success: true, data: transports });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};