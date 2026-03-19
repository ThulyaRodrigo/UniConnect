const express = require('express');
const router = express.Router();
const { 
    getVerifications, 
    scanSlipWithAI, 
    verifyBooking 
} = require('../controllers/verificationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Secure all routes for Society Admins
router.use(protect);
router.use(authorize('SocietyAdmin'));

router.get('/society/:societyId', getVerifications);
router.post('/scan/:bookingId', scanSlipWithAI);
router.put('/action/:bookingId', verifyBooking);

module.exports = router;