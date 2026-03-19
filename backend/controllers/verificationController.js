const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Tesseract = require('tesseract.js');
const Groq = require('groq-sdk');

// Initialize Groq SDK (It automatically picks up process.env.GROQ_API_KEY)
const groq = new Groq();

// Helper to map DB records to your React UI structure
const mapToUIFormat = (booking) => ({
    id: booking._id, 
    studentName: booking.primaryBuyer?.name || 'Unknown',
    event: booking.event?.title || 'Unknown Event',
    claimedAmount: booking.totalAmount,
    status: booking.status === 'Pending Verification' ? 'Pending' : booking.status,
    aiExtraction: booking.aiExtractionData || {},
    slipImage: booking.paymentSlipUrl,
    reason: booking.rejectionReason || 'Verified successfully',
    verifiedAt: booking.verifiedAt ? new Date(booking.verifiedAt).toLocaleString() : null
});

// @desc    Get all Pending & History Verifications
// @route   GET /api/verify/society/:societyId
// @access  Private (SocietyAdmin)
exports.getVerifications = async (req, res) => {
    try {
        const events = await Event.find({ society: req.params.societyId }).select('_id');
        const eventIds = events.map(e => e._id);

        const allBookings = await Booking.find({ 
            event: { $in: eventIds },
            paymentSlipUrl: { $ne: null } 
        })
        .populate('event', 'title')
        .populate('primaryBuyer', 'name')
        .sort({ createdAt: -1 });

        const pending = allBookings.filter(b => b.status === 'Pending Verification').map(mapToUIFormat);
        const history = allBookings.filter(b => b.status !== 'Pending Verification').map(mapToUIFormat);

        res.status(200).json({ success: true, data: { pending, history } });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};