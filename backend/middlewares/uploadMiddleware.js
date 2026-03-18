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
    folder: 'uniconnets_events', // The folder name in your Cloudinary dashboard
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 1280, height: 720, crop: 'limit' }] // Optimize size automatically!
  },
});

const upload = multer({ storage: storage });

module.exports = upload;