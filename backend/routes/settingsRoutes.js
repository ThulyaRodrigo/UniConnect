const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const createSettingsUpload = require('../middlewares/settingsUploadMiddleware');

// @route   GET /api/settings
// @desc    Get public portal settings
// @access  Public
router.get('/', settingsController.getSettings);

// @route   PUT /api/settings/maintenance
// @desc    Update Maintenance Mode
// @access  SuperAdmin
router.put('/maintenance', protect, authorize('SuperAdmin'), settingsController.updateMaintenanceMode);

// @route   POST /api/settings/carousel
// @desc    Upload Carousel Image
// @access  SuperAdmin
router.post('/carousel', protect, authorize('SuperAdmin'), createSettingsUpload.single('image'), settingsController.addCarouselImage);

// @route   DELETE /api/settings/carousel/:id
// @desc    Remove Carousel Image by ID
// @access  SuperAdmin
router.delete('/carousel/:id', protect, authorize('SuperAdmin'), settingsController.removeCarouselImage);

// @route   PUT /api/settings/logo
// @desc    Upload Logo
// @access  SuperAdmin
router.put('/logo', protect, authorize('SuperAdmin'), createSettingsUpload.single('logo'), settingsController.updateLogo);

module.exports = router;
