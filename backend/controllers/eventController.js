const Event = require('../models/Event');
const Society = require('../models/Society');
const MasterRoute = require('../models/MasterRoute');
const Transport = require('../models/Transport');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (SocietyAdmin)
exports.createEvent = async (req, res) => {
    try {
        // req.file contains the Cloudinary upload data thanks to our middleware!
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an event poster image' });
        }

        const { title, date, time, category, location, price, capacity, description, societyId } = req.body;

        // Verify the user actually manages this society
        if (!req.user.adminSocieties.includes(societyId)) {
            return res.status(403).json({ message: 'You are not authorized to create events for this society' });
        }

        const newEvent = await Event.create({
            title, date, time, category, location, price, capacity, description,
            society: societyId,
            createdBy: req.user._id,
            image: req.file.path // The secure Cloudinary URL
        });

        // Add auto-transport generation logic
        if (req.body.enableTransport === 'true') {
            const masterRoutes = await MasterRoute.find({ status: 'Active' });
            
            if (masterRoutes.length > 0) {
                const transportDocs = masterRoutes.map(mr => ({
                    route: mr.destination,
                    totalCapacity: mr.capacity,
                    remainingSeats: mr.capacity,
                    event: newEvent._id
                }));
                await Transport.insertMany(transportDocs);
            }
        }

        res.status(201).json({ success: true, data: newEvent });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all events for a SPECIFIC society (For the Admin Dashboard)
// @route   GET /api/events/society/:societyId
// @access  Private (SocietyAdmin)
exports.getSocietyEvents = async (req, res) => {
    try {
        const events = await Event.find({ society: req.params.societyId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get ALL events (For the public Student Browse Events page)
// @route   GET /api/events
// @access  Public
exports.getAllEvents = async (req, res) => {
    try {
        // Populate the society details so the frontend can display the society name
        const events = await Event.find().populate('society', 'name category logo').sort({ date: 1 });
        res.status(200).json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};