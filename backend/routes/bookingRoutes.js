const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Secure all booking routes
router.use(protect);

// The POST route expects a file named 'paymentSlip' inside the FormData
router.post('/', upload.single('paymentSlip'), createBooking);

router.get('/my-tickets', getMyBookings);

module.exports = router;