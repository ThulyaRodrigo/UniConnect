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

// @desc    Update a transport route (e.g., increasing capacity)
// @route   PUT /api/transports/:id
// @access  Private (SocietyAdmin)
exports.updateTransport = async (req, res) => {
    try {
        const { route, totalCapacity } = req.body;
        let transport = await Transport.findById(req.params.id);

        if (!transport) {
            return res.status(404).json({ message: 'Transport route not found' });
        }

        // If capacity changes, we must adjust remaining seats safely
        let newRemainingSeats = transport.remainingSeats;
        if (totalCapacity) {
            const capacityDifference = totalCapacity - transport.totalCapacity;
            newRemainingSeats = transport.remainingSeats + capacityDifference;
            
            // Prevent negative remaining seats if they try to shrink the bus too much
            if (newRemainingSeats < 0) {
                 return res.status(400).json({ message: 'Cannot reduce capacity below currently booked seats.' });
            }
        }

        transport.route = route || transport.route;
        transport.totalCapacity = totalCapacity || transport.totalCapacity;
        transport.remainingSeats = newRemainingSeats;

        await transport.save();

        res.status(200).json({ success: true, data: transport });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a transport route
// @route   DELETE /api/transports/:id
// @access  Private (SocietyAdmin)
exports.deleteTransport = async (req, res) => {
    try {
        const transport = await Transport.findById(req.params.id);

        if (!transport) {
            return res.status(404).json({ message: 'Transport route not found' });
        }

        // Optional safety check: Don't allow deletion if students have already booked it!
        if (transport.remainingSeats !== transport.totalCapacity) {
            return res.status(400).json({ message: 'Cannot delete a route that has active bookings.' });
        }

        await transport.deleteOne();

        res.status(200).json({ success: true, message: 'Transport route removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};