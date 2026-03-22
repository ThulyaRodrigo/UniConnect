const express = require('express');
const router = express.Router();
const { createSociety, getSocieties, getSocietySettings, updateSocietySettings, deactivateSociety } = require('../controllers/societyController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Anyone logged in (or even public visitors) can view societies
router.get('/', getSocieties);

// ONLY a SuperAdmin can create a society
router.post('/', protect, authorize('SuperAdmin'), createSociety);

// Society Settings (SocietyAdmin or SuperAdmin)
router.get('/:id/settings', protect, getSocietySettings);
router.put('/:id/settings', protect, upload.single('logo'), updateSocietySettings);

// SuperAdmin can deactivate a society
router.delete('/:id', protect, authorize('SuperAdmin'), deactivateSociety);

module.exports = router;