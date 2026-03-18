const express = require('express');
const router = express.Router();
const { 
    searchStudents, getSocietyBoard, promoteAdmin, 
    demoteAdmin, getHandoverHistory 
} = require('../controllers/handoverController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Secure all routes in this file
router.use(protect);
router.use(authorize('SuperAdmin'));

router.get('/search', searchStudents);
router.get('/society/:id/board', getSocietyBoard);
router.post('/society/:id/promote', promoteAdmin);
router.post('/society/:id/demote', demoteAdmin);
router.get('/society/:id/history', getHandoverHistory);

module.exports = router;