const PortalSettings = require('../models/PortalSettings');

// @desc    Get portal settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res) => {
    try {
        const settings = await PortalSettings.getSettings();
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching settings', error: error.message });
    }
};

// @desc    Update Maintenance Mode
// @route   PUT /api/settings/maintenance
// @access  SuperAdmin
exports.updateMaintenanceMode = async (req, res) => {
    try {
        const { isEnabled } = req.body;
        const settings = await PortalSettings.getSettings();
        settings.maintenanceMode = isEnabled;
        await settings.save();

        // Broadcast to clients using socket.io
        const io = req.app.get('io');
        if (io) {
            io.emit('maintenance_mode_toggled', { maintenanceMode: settings.maintenanceMode });
        }

        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error updating maintenance mode', error: error.message });
    }
};

// @desc    Upload & Add Carousel Image
// @route   POST /api/settings/carousel
// @access  SuperAdmin
exports.addCarouselImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        const settings = await PortalSettings.getSettings();

        if (settings.carouselImages.length >= 6) {
            return res.status(400).json({ message: 'Maximum 6 images allowed in carousel. Remove one first.' });
        }

        const newImage = {
            url: req.file.path, // Cloudinary URL
            name: req.file.originalname,
            size: (req.file.size / (1024 * 1024)).toFixed(2) + 'MB' // Approximate size
        };

        settings.carouselImages.push(newImage);
        await settings.save();

        res.status(201).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
};

// @desc    Remove Carousel Image
// @route   DELETE /api/settings/carousel/:id
// @access  SuperAdmin
exports.removeCarouselImage = async (req, res) => {
    try {
        const imageId = req.params.id;
        const settings = await PortalSettings.getSettings();

        // Filter out the deleted one
        settings.carouselImages = settings.carouselImages.filter(img => img._id.toString() !== imageId);
        await settings.save();

        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error removing image', error: error.message });
    }
};

// @desc    Upload Logo
// @route   PUT /api/settings/logo
// @access  SuperAdmin
exports.updateLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No logo uploaded' });
        }

        const settings = await PortalSettings.getSettings();
        settings.logo = req.file.path; // Cloudinary URL
        await settings.save();

        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error updating logo', error: error.message });
    }
};
