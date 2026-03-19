const express = require('express');
const router = express.Router();
const { 
    createTransport, 
    getTransportsForEvent, 
    updateTransport, 
    deleteTransport 
} = require('../controllers/transportController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public route: Students need this to populate the dropdown on BookTicket.jsx
router.get('/event/:eventId', getTransportsForEvent);

// Protected routes: Only Admins can modify logistics
router.post('/', protect, authorize('SocietyAdmin', 'SuperAdmin'), createTransport);
router.put('/:id', protect, authorize('SocietyAdmin', 'SuperAdmin'), updateTransport);
router.delete('/:id', protect, authorize('SocietyAdmin', 'SuperAdmin'), deleteTransport);

module.exports = router;