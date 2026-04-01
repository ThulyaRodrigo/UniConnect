const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middlewares/authMiddleware');
const feedbackUpload = require('../middlewares/feedbackUpload');
const {
  submitFeedback,
  getMyFeedbacks,
  getAllFeedbacks,
  replyFeedback,
} = require('../controllers/feedbackController');

// Student: submit feedback (with up to 3 attachments)
router.post(
  '/',
  protect,
  feedbackUpload.array('attachments', 3),
  submitFeedback
);

// Student: get their own feedback history
router.get('/mine', protect, getMyFeedbacks);

// SuperAdmin: get all feedbacks
router.get('/all', protect, authorize('SuperAdmin'), getAllFeedbacks);

// SuperAdmin: reply to a feedback
router.put('/:id/reply', protect, authorize('SuperAdmin'), replyFeedback);

module.exports = router;
