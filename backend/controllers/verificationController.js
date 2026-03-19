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

// @desc    Run Two-Step Scan (Tesseract OCR + Groq LLM)
// @route   POST /api/verify/scan/:bookingId
// @access  Private (SocietyAdmin)
exports.scanSlipWithAI = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking || !booking.paymentSlipUrl) return res.status(404).json({ message: 'Slip not found' });

        // PURE LOCAL OCR (Zero Rate Limits)
        let rawOcrText = "";
        try {
            // Tesseract can read directly from the Cloudinary URL!
            const { data: { text } } = await Tesseract.recognize(booking.paymentSlipUrl, 'eng');
            rawOcrText = text.trim();
        } catch (ocrError) {
            console.error("Tesseract Error:", ocrError);
            return res.status(500).json({ message: 'Failed to extract text from image' });
        }

        // If the image is completely blank or unreadable
        if (!rawOcrText) {
            booking.aiExtractionData = {
                amountFound: null,
                dateFound: null,
                refFound: null,
                matchConfidence: 'Low',
                suggestedRejectionReason: 'Image is completely unreadable or blank.'
            };
            await booking.save();
            const populatedFailedBooking = await Booking.findById(booking._id).populate('event', 'title').populate('primaryBuyer', 'name');
            return res.status(200).json({ success: true, data: mapToUIFormat(populatedFailedBooking) });
        }

        
        // LLM STRUCTURING (Groq Llama 3)
        const prompt = `
            You are a strict data extraction assistant. I have performed OCR on a bank transfer slip. 
            The messy raw OCR text is provided below.
            
            The student claims they paid an expected amount of: LKR ${booking.totalAmount}.
            
            Extract the data from the OCR text and return it strictly as a JSON object matching this schema perfectly:
            {
                "amountFound": Number (Extract the transferred amount. Exclude currency symbols. If not found, use null),
                "dateFound": String (Extract the date. If not found, use null),
                "refFound": String (Extract the reference or transaction ID. If not found, use null),
                "matchConfidence": String (Must be "High", "Medium", or "Low"),
                "suggestedRejectionReason": String (If amountFound is less than ${booking.totalAmount}, or data is missing, write a short 1-sentence reason. If it matches ${booking.totalAmount} perfectly, set to null)
            }

            RAW OCR TEXT:
            """
            ${rawOcrText}
            """
        `;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile', 
            temperature: 0, 
            response_format: { type: 'json_object' } 
        });

        const extractedData = JSON.parse(chatCompletion.choices[0].message.content);

        // Save the structured AI data to the booking
        booking.aiExtractionData = extractedData;
        await booking.save();

        const populatedBooking = await Booking.findById(booking._id).populate('event', 'title').populate('primaryBuyer', 'name');
        res.status(200).json({ success: true, data: mapToUIFormat(populatedBooking) });

    } catch (error) {
        res.status(500).json({ message: 'AI Processing Error', error: error.message });
    }
};