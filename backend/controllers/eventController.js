const Event = require('../models/Event');
const Society = require('../models/Society');

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

        res.status(201).json({ success: true, data: newEvent });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};