const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Transport = require('../models/Transport');
const User = require('../models/User');

// @desc    Create a new booking (Group or Single)
// @route   POST /api/bookings
// @access  Private (Student)
exports.createBooking = async (req, res) => {
    try {
        const { eventId, ticketCount, attendees } = req.body;
        
        // Ensure attendees array was sent and parse it from the FormData string
        let parsedAttendees;
        try {
            parsedAttendees = JSON.parse(attendees);
        } catch (e) {
            return res.status(400).json({ message: 'Invalid attendees data format' });
        }

        // Validate Event
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Calculate Total Amount
        const totalAmount = event.price * Number(ticketCount);

        // Validate Payment Slip (Require it if the event is not free)
        if (event.price > 0 && !req.file) {
             return res.status(400).json({ message: 'Payment slip is required for paid events.' });
        }

        // Handle Transport Logic (Decrementing Seats)
        // Do this in a loop. If a route is full, we must abort the whole transaction!
        for (const attendee of parsedAttendees) {
            if (attendee.transportRoute) {
                const transport = await Transport.findById(attendee.transportRoute);
                
                if (!transport) {
                    return res.status(404).json({ message: `Transport route not found.` });
                }

                if (transport.remainingSeats <= 0) {
                     return res.status(400).json({ 
                         message: `Sorry, the shuttle route '${transport.route}' is now fully booked.` 
                     });
                }

                // Reserve the seat by decrementing the count
                transport.remainingSeats -= 1;
                await transport.save();
            }
        }

        // Create the Booking Record
        const newBooking = await Booking.create({
            event: eventId,
            primaryBuyer: req.user._id,
            ticketCount: Number(ticketCount),
            totalAmount: totalAmount,
            paymentSlipUrl: req.file ? req.file.path : null, // The Cloudinary URL
            status: event.price === 0 ? 'Confirmed' : 'Pending Verification', // Free events auto-confirm!
            attendees: parsedAttendees.map(a => ({
                studentId: a.studentId,
                name: a.name,
                // Only save the ObjectId if they selected a route
                transportRoute: a.transportRoute ? a.transportRoute : null 
            }))
        });

        res.status(201).json({ 
            success: true, 
            message: 'Booking created successfully',
            data: newBooking 
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all bookings for the logged-in student AND bookings where they are an attendee
// @route   GET /api/bookings/my-tickets
// @access  Private (Student)
exports.getMyBookings = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        
        // Prepare case-insensitive Regex for flawless guest fetching
        const myId = currentUser.studentId ? currentUser.studentId.trim() : "";
        const myEmail = currentUser.email ? currentUser.email.trim() : "";

        // Build the OR array dynamically to avoid empty regex errors
        const orConditions = [{ primaryBuyer: req.user._id }];
        
        if (myId) {
            orConditions.push({ "attendees.studentId": { $regex: new RegExp(`^${myId}$`, 'i') } });
        }
        if (myEmail) {
            orConditions.push({ "attendees.studentId": { $regex: new RegExp(`^${myEmail}$`, 'i') } });
        }

        const bookings = await Booking.find({ $or: orConditions })
            .populate('event', 'title date time location')
            .populate('primaryBuyer', 'name studentId') // Populate buyer to show "Gifted by"
            .populate('attendees.transportRoute', 'route destination') // Ensure transport is populated
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};