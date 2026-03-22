const express = require('express');
const router = express.Router();
const { createEvent, getSocietyEvents, getAllEvents, getEventAttendees, deleteEvent, updateEvent } = require('../controllers/eventController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public route for students browsing
router.get('/', getAllEvents);

// Protected routes for Society Admins
router.get('/society/:societyId', protect, authorize('SocietyAdmin'), getSocietyEvents);

// Notice how `upload.single('image')` sits right before `createEvent`. 
// It grabs the file named 'image' from the frontend, uploads it to Cloudinary, and passes the URL to the controller!
router.post('/', protect, authorize('SocietyAdmin'), upload.single('image'), createEvent);

router.get('/:id/attendees', protect, authorize('SocietyAdmin'), getEventAttendees);
router.delete('/:id', protect, authorize('SocietyAdmin'), deleteEvent);
router.put('/:id', protect, authorize('SocietyAdmin'), upload.single('image'), updateEvent);

module.exports = router;