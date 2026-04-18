const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Transport = require('../models/Transport');
const User = require('../models/User');
const sendTicketEmail = require('../utils/emailService');
const qrcode = require('qrcode');

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

        // =========================================================================
        // COMMUNICATION ECOSYSTEM: Instantly dispatch QR emails for FREE events
        // =========================================================================
        if (event.price === 0) {
            const populatedBuyer = await User.findById(req.user._id);

            for (const attendee of newBooking.attendees) {
                const attendeeUser = await User.findOne({ 
                    $or: [{ studentId: attendee.studentId }, { email: attendee.studentId }] 
                });
                
                if (attendeeUser && attendeeUser.email) {
                    const uniqueTicketId = `TKT-${attendee._id.toString().slice(-6).toUpperCase()}`;
                    
                    let shuttleInfo = 'No Transport Selected';
                    if (attendee.transportRoute) {
                        const transportDoc = await Transport.findById(attendee.transportRoute);
                        if (transportDoc) shuttleInfo = transportDoc.route;
                    }

                    const qrData = JSON.stringify({ 
                        ticketId: attendee._id, 
                        bookingId: newBooking._id,
                        studentId: attendee.studentId
                    });
                    const qrBuffer = await qrcode.toBuffer(qrData, { type: 'png', margin: 2, width: 300 });

                    const htmlContent = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                            <div style="background-color: #053668; color: white; padding: 30px; text-align: center;">
                                <h1 style="margin: 0; font-size: 24px;">You're Going to ${event.title}! 🎉</h1>
                            </div>
                            <div style="padding: 30px; background-color: #f8fafc;">
                                <p style="font-size: 16px; color: #333;">Hi ${attendee.name},</p>
                                <p style="font-size: 16px; color: #555; line-height: 1.5;">
                                    Great news! Your ticket has been confirmed. Get ready to expand your horizons and experience something amazing.
                                </p>
                                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                                    <p style="margin: 5px 0; color: #053668; font-size: 18px;"><strong>Ticket ID: ${uniqueTicketId}</strong></p>
                                    <hr style="border: none; border-top: 1px dashed #ccc; margin: 10px 0;" />
                                    <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${event.date}</p>
                                    <p style="margin: 5px 0;"><strong>⏰ Time:</strong> ${event.time}</p>
                                    <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${event.location}</p>
                                    <p style="margin: 5px 0; color: #FF7100;"><strong>🚌 Shuttle:</strong> ${shuttleInfo}</p>
                                    ${populatedBuyer.studentId !== attendee.studentId ? `<p style="margin: 5px 0; color: #16a34a;"><strong>🎁 Gifted by:</strong> ${populatedBuyer.name}</p>` : ''}
                                </div>
                                <div style="text-align: center; margin-top: 30px;">
                                    <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Your Official E-Ticket QR Code</p>
                                    <img src="cid:unique-qr-code" alt="Ticket QR Code" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 200px; height: 200px;" />
                                    <p style="font-size: 12px; color: #999; margin-top: 10px;">Please present this QR code at the entrance or bus pickup.</p>
                                </div>
                            </div>
                        </div>
                    `;

                    // Run email dispatch asynchronously
                    sendTicketEmail({
                        email: attendeeUser.email,
                        subject: `Confirmed: Your Ticket to ${event.title}`,
                        html: htmlContent,
                        attachments: [{ filename: 'ticket-qr.png', content: qrBuffer, cid: 'unique-qr-code' }]
                    }).catch(err => console.error("Failed to send free ticket email to", attendeeUser.email, err));
                }
            }
        }

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