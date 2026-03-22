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

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (SocietyAdmin)
exports.updateEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        let event = await Event.findById(eventId);
        
        if (!event) return res.status(404).json({ message: 'Event not found' });
        
        // Track changes 
        const oldData = { ...event.toObject() };
        
        const { title, date, time, category, location, price, capacity, description, enableTransport } = req.body;
        
        event.title = title || event.title;
        event.date = date || event.date;
        event.time = time || event.time;
        event.category = category || event.category;
        event.location = location || event.location;
        event.price = price !== undefined ? price : event.price;
        event.capacity = capacity || event.capacity;
        event.description = description || event.description;
        
        if (req.file) {
            event.image = req.file.path; // update image if uploaded
        }

        await event.save();

        // Check if important details changed that require notifying users
        const detailsChanged = (oldData.date !== event.date || oldData.time !== event.time || oldData.location !== event.location);

        if (detailsChanged) {
            const bookings = await Booking.find({ event: eventId, status: { $in: ['Confirmed', 'Pending Verification'] } })
                .populate('primaryBuyer', 'name email');
            
            const uniqueEmails = new Map();
            bookings.forEach(b => {
                // Add the primary buyer
                if (b.primaryBuyer && b.primaryBuyer.email) {
                    uniqueEmails.set(b.primaryBuyer.email, b.primaryBuyer.name);
                }
                
                // Add all attendees via SLIIT standard email structure
                if (b.attendees && b.attendees.length > 0) {
                    b.attendees.forEach(attendee => {
                        if (attendee.studentId) {
                            const studentEmail = `${attendee.studentId.toLowerCase()}@my.sliit.lk`;
                            uniqueEmails.set(studentEmail, attendee.name);
                        }
                    });
                }
            });

            const emailPromises = Array.from(uniqueEmails.entries()).map(([email, name]) => {
                return sendTicketEmail({
                    email: email,
                    subject: `IMPORTANT: Update for Event - ${event.title}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2>Event Update Notification</h2>
                            <p>Hi ${name},</p>
                            <p>The event <strong>${event.title}</strong> that you have tickets for has been updated. Please note the following new details:</p>
                            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                <p><strong>New Date:</strong> ${event.date}</p>
                                <p><strong>New Time:</strong> ${event.time}</p>
                                <p><strong>New Location:</strong> ${event.location}</p>
                            </div>
                            <p>Your tickets remain valid. If you have any questions, please contact the society organizers.</p>
                            <p>Best Regards,<br>UniConnect Events</p>
                        </div>
                    `
                });
            });

            await Promise.allSettled(emailPromises);
        }

        res.status(200).json({ success: true, data: event, message: 'Event updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};