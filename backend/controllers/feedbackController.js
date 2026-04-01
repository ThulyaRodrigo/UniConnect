const SystemFeedback = require('../models/SystemFeedback');

// POST /api/feedback 
// Student submits new feedback. Handles multipart/form-data with up to 3 files.
exports.submitFeedback = async (req, res) => {
  try {
    const { type, description, rating } = req.body;

    if (!type || !description) {
      return res.status(400).json({ message: 'Type and description are required.' });
    }

    // Validate rating is provided for Feedback type
    if (type === 'Feedback' && (!rating || rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'A rating between 1 and 5 is required for Feedback.' });
    }

    // Collect Cloudinary URLs from uploaded files (via feedbackUpload middleware)
    const attachments = req.files ? req.files.map((f) => f.path) : [];

    // Attachments only allowed for Suggestion / Bug
    if (type === 'Feedback' && attachments.length > 0) {
      return res.status(400).json({ message: 'Attachments are not allowed for Feedback type.' });
    }

    if (attachments.length > 3) {
      return res.status(400).json({ message: 'A maximum of 3 attachments are allowed.' });
    }

    const feedback = await SystemFeedback.create({
      student: req.user._id,
      type,
      description,
      rating: type === 'Feedback' ? Number(rating) : null,
      attachments,
    });

    res.status(201).json({ message: 'Feedback submitted successfully.', data: feedback });
  } catch (error) {
    console.error('submitFeedback error:', error);
    res.status(500).json({ message: 'Server error while submitting feedback.' });
  }
};

// GET /api/feedback/mine 
// Student fetches their own feedback history (newest first).
exports.getMyFeedbacks = async (req, res) => {
  try {
    const feedbacks = await SystemFeedback.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .populate('repliedBy', 'name');

    res.status(200).json({ data: feedbacks });
  } catch (error) {
    console.error('getMyFeedbacks error:', error);
    res.status(500).json({ message: 'Server error while fetching feedback history.' });
  }
};

//  GET /api/feedback/all
// SuperAdmin fetches all feedbacks (newest first).
exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await SystemFeedback.find()
      .sort({ createdAt: -1 })
      .populate('student', 'name email studentId')
      .populate('repliedBy', 'name');

    res.status(200).json({ data: feedbacks });
  } catch (error) {
    console.error('getAllFeedbacks error:', error);
    res.status(500).json({ message: 'Server error while fetching all feedbacks.' });
  }
};

// PUT /api/feedback/:id/reply 
exports.replyFeedback = async (req, res) => {
  try {
    const { adminReply } = req.body;

    if (!adminReply || !adminReply.trim()) {
      return res.status(400).json({ message: 'Reply message cannot be empty.' });
    }

    const feedback = await SystemFeedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found.' });
    }

    feedback.adminReply = adminReply.trim();
    feedback.repliedAt = new Date();
    feedback.repliedBy = req.user._id;
    await feedback.save();

    res.status(200).json({ message: 'Reply sent successfully.', data: feedback });
  } catch (error) {
    console.error('replyFeedback error:', error);
    res.status(500).json({ message: 'Server error while replying to feedback.' });
  }
};
