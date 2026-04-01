const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up the storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uniconnets_settings', // The folder name for portal settings
    allowed_formats: ['jpg', 'jpeg', 'png', 'svg'],
    // Large limits for carousel, but let's let cloudinary optimize it.
    transformation: [{ width: 1920, height: 1080, crop: 'limit' }]
  },
});

module.exports = multer({ storage: storage });
