const Event = require('../models/Event');
const Society = require('../models/Society');
const MasterRoute = require('../models/MasterRoute');
const Transport = require('../models/Transport');
const Booking = require('../models/Booking');
const User = require('../models/User');
const sendTicketEmail = require('../utils/emailService');

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

        // Aggregate confirmed+pending ticket counts per event to attach to response
        const bookingCounts = await Booking.aggregate([
            { $match: { status: { $in: ['Confirmed', 'Pending Verification'] } } },
            { $group: { _id: '$event', bookedCount: { $sum: '$ticketCount' } } }
        ]);

        // Build a quick lookup map: eventId -> bookedCount
        const countMap = {};
        bookingCounts.forEach(b => { countMap[b._id.toString()] = b.bookedCount; });

        // Attach bookedCount to each event
        const eventsWithAvailability = events.map(event => ({
            ...event.toObject(),
            bookedCount: countMap[event._id.toString()] || 0
        }));

        res.status(200).json({ success: true, data: eventsWithAvailability });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get ALL events (For the public Student Browse Events page)
// @route   GET /api/events
// @access  Public
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().populate('society', 'name category logo').sort({ date: 1 });

        // Aggregate confirmed+pending ticket counts per event in one query
        const bookingCounts = await Booking.aggregate([
            { $match: { status: { $in: ['Confirmed', 'Pending Verification'] } } },
            { $group: { _id: '$event', bookedCount: { $sum: '$ticketCount' } } }
        ]);

        // Build a quick lookup map: eventId -> bookedCount
        const countMap = {};
        bookingCounts.forEach(b => { countMap[b._id.toString()] = b.bookedCount; });

        // Attach bookedCount to each event
        const eventsWithAvailability = events.map(event => ({
            ...event.toObject(),
            bookedCount: countMap[event._id.toString()] || 0
        }));

        res.status(200).json({ success: true, data: eventsWithAvailability });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all attendees for a specific event
// @route   GET /api/events/:id/attendees
// @access  Private (SocietyAdmin)
exports.getEventAttendees = async (req, res) => {
    try {
        const eventId = req.params.id;
        const bookings = await Booking.find({ event: eventId, status: { $in: ['Confirmed', 'Pending Verification'] } })
            .populate('primaryBuyer', 'name email phone');

        const attendeesData = [];
        bookings.forEach(booking => {
            const isGroup = booking.ticketCount > 1;
            booking.attendees.forEach(attendee => {
                attendeesData.push({
                    studentId: attendee.studentId,
                    name: attendee.name,
                    phone: booking.primaryBuyer?.phone || 'N/A',
                    bookingType: isGroup ? 'Group' : 'Single',
                    buyerEmail: booking.primaryBuyer?.email || 'N/A'
                });
            });
        });

        res.status(200).json({ success: true, count: attendeesData.length, data: attendeesData });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (SocietyAdmin)
exports.deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const bookingCount = await Booking.countDocuments({ event: eventId });

        if (bookingCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot delete this event since there are ${bookingCount} existing bookings for it.` 
            });
        }

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        await event.deleteOne();
        res.status(200).json({ success: true, message: 'Event successfully deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

