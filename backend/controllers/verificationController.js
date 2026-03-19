const Booking = require('../models/Booking');
const Event = require('../models/Event');
const axios = require('axios');
const Tesseract = require('tesseract.js');
const Groq = require('groq-sdk');
const { GoogleGenAI } = require('@google/genai');

// Initialize AI SDKs
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

// @desc    Run Primary Gemini Scan with Tesseract/Groq Fallback
// @route   POST /api/verify/scan/:bookingId
// @access  Private (SocietyAdmin)
exports.scanSlipWithAI = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking || !booking.paymentSlipUrl) return res.status(404).json({ message: 'Slip not found' });

        // Fetch Image Data (Used by both Gemini and Tesseract)
        const imageResponse = await axios.get(booking.paymentSlipUrl, { responseType: 'arraybuffer' });
        const mimeType = imageResponse.headers['content-type'];
        const imageBuffer = Buffer.from(imageResponse.data, 'binary');
        const base64Image = imageBuffer.toString('base64');

        let extractedData;

        // PIPELINE A: GEMINI VISION (Primary Method
        try {
            const geminiPrompt = `
                Analyze this bank transfer slip. Expected amount: LKR ${booking.totalAmount}.
                Return strictly as a JSON object without markdown formatting.
                
                Keys:
                - amountFound: (Number) Exact amount transferred. Exclude currency symbols.
                - dateFound: (String) Transaction date.
                - refFound: (String) Reference number.
                - matchConfidence: (String) "High", "Medium", or "Low". Rate the overall validity of this slip. If the image is blurry, cropped, or the amount doesn't match, output "Low" or "Medium". If it is a clear image and amounts match perfectly, output "High".
                - suggestedRejectionReason: (String) If amountFound != ${booking.totalAmount}, or the image is blurry/unreadable, write a 1-sentence reason (e.g., "Image is too blurry" or "Amount paid is less than expected"). Otherwise, set to null.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-1.5-flash', 
                contents: [geminiPrompt, { inlineData: { data: base64Image, mimeType: mimeType } }]
            });

            const rawText = response.text().trim();
            const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '');
            extractedData = JSON.parse(cleanJson);
            console.log("✅ Verification successful via Gemini Pipeline");

        } catch (geminiError) {
            console.warn("⚠️ Gemini Pipeline Failed (Quota/Region Limit). Initiating Tesseract+Groq Fallback...", geminiError.message);

            // PIPELINE B: TESSERACT + GROQ (Fallback Method)
            
            // Run Tesseract directly on the buffer we already downloaded
            const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
            const rawOcrText = text.trim();

            const groqPrompt = `
                You are a strict data extraction assistant. I used OCR to read a bank slip. The messy raw text is below.
                Expected amount: LKR ${booking.totalAmount}.
                
                Return strictly as a JSON object matching this schema:
                {
                    "amountFound": Number (Extract transferred amount. Use null if not found),
                    "dateFound": String,
                    "refFound": String,
                    "matchConfidence": String ("High", "Medium", or "Low"),
                    "suggestedRejectionReason": String (Short 1-sentence reason or null)
                }

                RULES FOR CONFIDENCE & REJECTION:
                Since you cannot see the image, you MUST deduce its quality from the OCR text. 
                - If the OCR text is mostly random symbols, gibberish, or completely missing the amount/date, the original image was blurry or invalid. Set matchConfidence to "Low" and suggestedRejectionReason to "Image appears blurry or invalid based on OCR extraction."
                - If the amountFound is different from ${booking.totalAmount}, set matchConfidence to "Low" and explain the amount mismatch.
                - If the text is clean and the amount matches, set matchConfidence to "High" and suggestedRejectionReason to null.

                RAW OCR TEXT:
                """
                ${rawOcrText}
                """
            `;

            const chatCompletion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: groqPrompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0, 
                response_format: { type: 'json_object' } 
            });

            extractedData = JSON.parse(chatCompletion.choices[0].message.content);
            console.log("✅ Verification successful via Tesseract+Groq Fallback");
        }

        // Save the extracted data (Regardless of which pipeline succeeded)
        booking.aiExtractionData = extractedData;
        await booking.save();

        const populatedBooking = await Booking.findById(booking._id).populate('event', 'title').populate('primaryBuyer', 'name');
        res.status(200).json({ success: true, data: mapToUIFormat(populatedBooking) });

    } catch (error) {
        res.status(500).json({ message: 'AI Processing Error', error: error.message });
    }
};

// @desc    Approve or Reject a Booking
// @route   PUT /api/verify/action/:bookingId
// @access  Private (SocietyAdmin)
exports.verifyBooking = async (req, res) => {
    try {
        const { action, reason } = req.body; 
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.status = action === 'Approved' ? 'Confirmed' : 'Rejected';
        if (action === 'Rejected') booking.rejectionReason = reason;
        
        booking.verifiedAt = new Date();
        await booking.save();

        const populatedBooking = await Booking.findById(booking._id).populate('event', 'title').populate('primaryBuyer', 'name');
        res.status(200).json({ success: true, data: mapToUIFormat(populatedBooking) });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};