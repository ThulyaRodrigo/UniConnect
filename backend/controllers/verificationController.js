const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Transport = require('../models/Transport');
const axios = require('axios');
const Tesseract = require('tesseract.js');
const Groq = require('groq-sdk');
const { GoogleGenAI } = require('@google/genai');
const User = require('../models/User');
const sendTicketEmail = require('../utils/emailService');
const qrcode = require('qrcode');

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

        const imageResponse = await axios.get(booking.paymentSlipUrl, { responseType: 'arraybuffer' });
        const mimeType = imageResponse.headers['content-type'];
        const imageBuffer = Buffer.from(imageResponse.data, 'binary');
        const base64Image = imageBuffer.toString('base64');

        let extractedData;

        // PIPELINE A: GEMINI VISION (Primary Method)
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

        booking.aiExtractionData = extractedData;
        await booking.save();

        const populatedBooking = await Booking.findById(booking._id).populate('event', 'title').populate('primaryBuyer', 'name');
        res.status(200).json({ success: true, data: mapToUIFormat(populatedBooking) });

    } catch (error) {
        res.status(500).json({ message: 'AI Processing Error', error: error.message });
    }
};

// @desc    Approve or Reject a Booking, Send Emails, and Release Seats
// @route   PUT /api/verify/action/:bookingId
// @access  Private (SocietyAdmin)
exports.verifyBooking = async (req, res) => {
    try {
        const { action, reason } = req.body; 
        
        const booking = await Booking.findById(req.params.bookingId)
            .populate('event')
            .populate('primaryBuyer', 'name email studentId')
            .populate('attendees.transportRoute', 'route');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.status = action === 'Approved' ? 'Confirmed' : 'Rejected';
        
        if (action === 'Rejected') {
            booking.rejectionReason = reason;
            
            // INVENTORY RELEASE LOGIC
            for (let attendee of booking.attendees) {
                if (attendee.transportRoute) {
                    const transportToRelease = await Transport.findById(attendee.transportRoute._id);
                    if (transportToRelease) {
                        transportToRelease.remainingSeats += 1;
                        await transportToRelease.save();
                    }
                    attendee.transportRoute = null; // Clear to prevent ghost data
                }
            }
        }
        
        booking.verifiedAt = new Date();
        await booking.save();

        // COMMUNICATION ECOSYSTEM LOGIC
        for (const attendee of booking.attendees) {
            const attendeeUser = await User.findOne({ 
                $or: [{ studentId: attendee.studentId }, { email: attendee.studentId }] 
            });
            
            if (attendeeUser && attendeeUser.email) {
                if (action === 'Approved') {
                    const uniqueTicketId = `TKT-${attendee._id.toString().slice(-6).toUpperCase()}`;
                    const shuttleInfo = attendee.transportRoute ? attendee.transportRoute.route : 'No Transport Selected';

                    const qrData = JSON.stringify({ 
                        ticketId: attendee._id, 
                        bookingId: booking._id,
                        studentId: attendee.studentId
                    });
                    const qrBuffer = await qrcode.toBuffer(qrData, { type: 'png', margin: 2, width: 300 });

                    const htmlContent = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                            <div style="background-color: #053668; color: white; padding: 30px; text-align: center;">
                                <h1 style="margin: 0; font-size: 24px;">You're Going to ${booking.event.title}! 🎉</h1>
                            </div>
                            <div style="padding: 30px; background-color: #f8fafc;">
                                <p style="font-size: 16px; color: #333;">Hi ${attendee.name},</p>
                                <p style="font-size: 16px; color: #555; line-height: 1.5;">
                                    Great news! Your ticket has been confirmed. Get ready to expand your horizons and experience something amazing.
                                </p>
                                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                                    <p style="margin: 5px 0; color: #053668; font-size: 18px;"><strong>Ticket ID: ${uniqueTicketId}</strong></p>
                                    <hr style="border: none; border-top: 1px dashed #ccc; margin: 10px 0;" />
                                    <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${booking.event.date}</p>
                                    <p style="margin: 5px 0;"><strong>⏰ Time:</strong> ${booking.event.time}</p>
                                    <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${booking.event.location}</p>
                                    <p style="margin: 5px 0; color: #FF7100;"><strong>🚌 Shuttle:</strong> ${shuttleInfo}</p>
                                    ${booking.primaryBuyer.studentId !== attendee.studentId ? `<p style="margin: 5px 0; color: #16a34a;"><strong>🎁 Gifted by:</strong> ${booking.primaryBuyer.name}</p>` : ''}
                                </div>
                                <div style="text-align: center; margin-top: 30px;">
                                    <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Your Official E-Ticket QR Code</p>
                                    <img src="cid:unique-qr-code" alt="Ticket QR Code" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 200px; height: 200px;" />
                                    <p style="font-size: 12px; color: #999; margin-top: 10px;">Please present this QR code at the entrance or bus pickup.</p>
                                </div>
                            </div>
                        </div>
                    `;

                    await sendTicketEmail({
                        email: attendeeUser.email,
                        subject: `Confirmed: Your Ticket to ${booking.event.title}`,
                        html: htmlContent,
                        attachments: [{ filename: 'ticket-qr.png', content: qrBuffer, cid: 'unique-qr-code' }]
                    });

                } else if (action === 'Rejected') {
                    const htmlContent = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fecaca; border-radius: 12px; overflow: hidden;">
                            <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
                                <h2 style="margin: 0;">Payment Verification Failed</h2>
                            </div>
                            <div style="padding: 30px;">
                                <p>Hi ${attendee.name},</p>
                                <p>Unfortunately, the society admin could not verify the payment slip for <strong>${booking.event.title}</strong>.</p>
                                <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; color: #991b1b;">
                                    <strong>Admin Reason:</strong> ${reason}
                                </div>
                                <p style="color: #dc2626; font-weight: bold;">Action Required:</p>
                                <p>Your reserved shuttle seats have been released back to the university pool. <strong>You must return to the platform and create a brand-new booking</strong> with a valid payment slip to secure your spot.</p>
                                <p>You can view this rejection in the "Ticket History" tab of your dashboard.</p>
                            </div>
                        </div>
                    `;

                    await sendTicketEmail({
                        email: attendeeUser.email,
                        subject: `Action Required: Payment Issue for ${booking.event.title}`,
                        html: htmlContent
                    });
                }
            }
        }

        res.status(200).json({ success: true, data: mapToUIFormat(booking) });
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};