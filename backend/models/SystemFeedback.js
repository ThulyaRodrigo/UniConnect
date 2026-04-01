const mongoose = require('mongoose');

const systemFeedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['Feedback', 'General Suggestion', 'Bug / Error Report'],
      required: true,
      default: 'Feedback',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    // Only applicable when type === 'Feedback'
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    // Cloudinary URLs – only for General Suggestion / Bug / Error Report (max 3)
    attachments: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 3,
        message: 'Maximum of 3 attachments allowed.',
      },
    },
    // System Admin reply
    adminReply: {
      type: String,
      default: null,
    },
    repliedAt: {
      type: Date,
      default: null,
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SystemFeedback', systemFeedbackSchema);
