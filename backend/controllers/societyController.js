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

// @desc    Get Society Settings & Board Members
// @route   GET /api/societies/:id/settings
// @access  Private (SocietyAdmin / SuperAdmin)
exports.getSocietySettings = async (req, res) => {
    try {
        // Fetch the society and heavily populate the board array with actual User data
        const society = await Society.findById(req.params.id)
            .populate({
                path: 'board.user',
                select: 'name email profilePic'
            });

        if (!society) return res.status(404).json({ message: 'Society not found' });

        // Since the board is inside the society document, we just send the society
        res.status(200).json({ success: true, data: society });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update Society Settings (Identity, Logo, Banking)
// @route   PUT /api/societies/:id/settings
// @access  Private (SocietyAdmin / SuperAdmin)
exports.updateSocietySettings = async (req, res) => {
    try {
        const society = await Society.findById(req.params.id);
        if (!society) return res.status(404).json({ message: 'Society not found' });

        // Update Text Fields
        if (req.body.description !== undefined) society.description = req.body.description;
        if (req.body.email !== undefined) society.email = req.body.email;
        if (req.body.website !== undefined) society.website = req.body.website;
        
        // Parse and update Bank Accounts (sent as JSON string via FormData)
        if (req.body.bankAccounts) {
            const parsedBanks = JSON.parse(req.body.bankAccounts);
            society.bankAccounts = parsedBanks;
        }

        // Handle Cloudinary Logo Upload
        if (req.file) {
            society.logo = req.file.path;
        }

        await society.save();
        
        // Return populated document so the UI updates instantly
        const updatedSociety = await Society.findById(req.params.id).populate('board.user', 'name email profilePic');
        
        res.status(200).json({ success: true, data: updatedSociety, message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};