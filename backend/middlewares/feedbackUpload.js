const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cloudinary is already configured via env in uploadMiddleware,
// but we re-configure here to be explicit and self-contained.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uniconnect_feedback',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
    // Keep originals so PDFs remain readable; only resize images
    transformation: [{ width: 1920, height: 1080, crop: 'limit' }],
    resource_type: 'auto', // Handles both images and PDFs
  },
});

// Allow up to 3 attachments per submission
const feedbackUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
});

module.exports = feedbackUpload;
