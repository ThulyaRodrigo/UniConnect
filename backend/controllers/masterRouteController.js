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


// SOCIETY ADMIN FUNCTIONS (TransportLogistics.jsx)


// @desc    Get Logistics Stats for Society Events
// @route   GET /api/routes/logistics/society/:societyId
// @access  Private (SocietyAdmin)
exports.getLogisticsStats = async (req, res) => {
    try {
        // 1. Get all events for this society
        const events = await Event.find({ society: req.params.societyId }).select('title date');
        const activeRoutes = await MasterRoute.find({ status: 'Active' });

        const logisticsData = [];

        // 2. Loop through each event to calculate bookings per route
        for (const event of events) {
            let totalEventBookings = 0;
            const routeStats = [];

            for (const route of activeRoutes) {
                // Count how many attendees selected THIS route for THIS event
                // This uses MongoDB aggregation to count the nested array items
                const bookings = await Booking.aggregate([
                    { $match: { event: event._id } },
                    { $unwind: "$attendees" },
                    { $match: { "attendees.transportRoute": route._id } },
                    { $count: "bookedCount" }
                ]);

                const booked = bookings.length > 0 ? bookings[0].bookedCount : 0;
                totalEventBookings += booked;

                routeStats.push({
                    id: route._id,
                    destination: route.destination,
                    capacity: route.capacity,
                    booked: booked
                });
            }

            // Only push the event to the dashboard if someone actually booked transport
            if (totalEventBookings > 0) {
                logisticsData.push({
                    id: event._id,
                    title: event.title,
                    date: new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                    totalBooked: totalEventBookings,
                    routes: routeStats
                });
            }
        }

        res.status(200).json({ success: true, data: logisticsData });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get Passenger Manifest for a specific Route on an Event
// @route   GET /api/routes/logistics/manifest/:eventId/:routeId
// @access  Private (SocietyAdmin)
exports.getRouteManifest = async (req, res) => {
    try {
        const { eventId, routeId } = req.params;

        // Fetch bookings for this event that include this route
        const bookings = await Booking.find({ event: eventId })
            .select('attendees')
            .lean();

        let manifest = [];

        // Extract the matching attendees
        bookings.forEach(booking => {
            booking.attendees.forEach(attendee => {
                if (attendee.transportRoute && attendee.transportRoute.toString() === routeId) {
                    manifest.push({
                        studentId: attendee.studentId,
                        name: attendee.name
                    });
                }
            });
        });

        res.status(200).json({ success: true, count: manifest.length, data: manifest });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};