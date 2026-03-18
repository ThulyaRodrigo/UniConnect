const express = require('express');
const router = express.Router();
const { createSociety, getSocieties } = require('../controllers/societyController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Anyone logged in (or even public visitors) can view societies
router.get('/', getSocieties);

// ONLY a SuperAdmin can create a society
router.post('/', protect, authorize('SuperAdmin'), createSociety);

module.exports = router;