const Society = require('../models/Society');
const Event = require('../models/Event');


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
        // Find all active societies, sort alphabetically by name, and populate event count
        const societies = await Society.find({ isActive: true }).populate('eventsHosted').sort({ name: 1 });
        
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

        // Since the board is inside the society document, we just send the society
        if (!society || !society.isActive) {
            return res.status(404).json({ message: 'Society not found or deactivated' });
        }
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
        if (!society || !society.isActive) {
            return res.status(404).json({ message: 'Society not found or deactivated' });
        }

        // Update Text Fields (Now including Name and Category for Super Admins)
        if (req.body.name !== undefined) society.name = req.body.name;
        if (req.body.category !== undefined) society.category = req.body.category;
        if (req.body.description !== undefined) society.description = req.body.description;
        if (req.body.email !== undefined) society.email = req.body.email;
        if (req.body.website !== undefined) society.website = req.body.website;
        
        // Parse and update Bank Accounts
        if (req.body.bankAccounts) {
            society.bankAccounts = JSON.parse(req.body.bankAccounts);
        }

        // Handle Cloudinary Logo Upload
        if (req.file) {
            society.logo = req.file.path;
        }

        await society.save();
        
        const updatedSociety = await Society.findById(req.params.id).populate('board.user', 'name email profilePic');
        res.status(200).json({ success: true, data: updatedSociety, message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Deactivate a society (Soft Delete)
// @route   DELETE /api/societies/:id
// @access  Private/SuperAdmin
exports.deactivateSociety = async (req, res) => {
    try {
        const society = await Society.findById(req.params.id);
        if (!society || !society.isActive) {
            return res.status(404).json({ message: 'Society not found or already deactivated' });
        }

        const today = new Date().toISOString().split('T')[0];
        const upcomingEventsCount = await Event.countDocuments({ 
            society: req.params.id, 
            date: { $gte: today } 
        });

        if (upcomingEventsCount > 0) {
            return res.status(400).json({ 
                message: `Cannot deactivate society. There are ${upcomingEventsCount} upcoming events.` 
            });
        }

        society.isActive = false;
        // Optional: Also mark all board members as removed or something, but lets keep it simple
        await society.save();

        res.status(200).json({ success: true, message: 'Society deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};