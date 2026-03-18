const Society = require('../models/Society');

// @desc    Create a new society
// @route   POST /api/societies
// @access  Private/SuperAdmin
exports.createSociety = async (req, res) => {
    try {
        const { name, category } = req.body;

        if (!name || !category) {
            return res.status(400).json({ message: 'Please provide society name and category' });
        }

        // Check for duplicates
        const existingSociety = await Society.findOne({ name });
        if (existingSociety) {
            return res.status(400).json({ message: 'A society with this name already exists' });
        }

        const society = await Society.create({
            name,
            category
        });

        res.status(201).json({
            success: true,
            data: society
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all societies
// @route   GET /api/societies
// @access  Public (or Private depending on if students need to see a list)
exports.getSocieties = async (req, res) => {
    try {
        // Find all active societies, sort alphabetically by name
        const societies = await Society.find({ isActive: true }).sort({ name: 1 });
        
        res.status(200).json({
            success: true,
            count: societies.length,
            data: societies
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};