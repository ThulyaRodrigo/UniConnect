const User = require('../models/User');
const HandoverLog = require('../models/HandoverLog');

// @desc    Search students to promote
// @route   GET /api/handover/search?q=email
// @access  Private/SuperAdmin
exports.searchStudents = async (req, res) => {
    try {
        const keyword = req.query.q ? {
            $or: [
                { name: { $regex: req.query.q, $options: 'i' } },
                { email: { $regex: req.query.q, $options: 'i' } }
            ]
        } : {};

        // Only search for active students or existing admins
        const users = await User.find({ ...keyword }).select('name email role adminSocieties').limit(5);
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get current board members of a society
// @route   GET /api/handover/society/:id/board
// @access  Private/SuperAdmin
exports.getSocietyBoard = async (req, res) => {
    try {
        const board = await User.find({ adminSocieties: req.params.id }).select('name email role');
        res.status(200).json({ success: true, data: board });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Promote student to Society Admin
// @route   POST /api/handover/society/:id/promote
// @access  Private/SuperAdmin
exports.promoteAdmin = async (req, res) => {
    try {
        const { userId } = req.body;
        const societyId = req.params.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent duplicate assignment
        if (user.adminSocieties.includes(societyId)) {
            return res.status(400).json({ message: 'User is already an admin for this society' });
        }

        user.adminSocieties.push(societyId);
        user.role = 'SocietyAdmin'; // Elevate privileges
        await user.save();

        // Log the audit trail
        await HandoverLog.create({
            society: societyId,
            user: userId,
            action: 'Promoted to Admin',
            performedBy: req.user._id // The SuperAdmin who did this
        });

        res.status(200).json({ success: true, message: 'User promoted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Demote an admin and revoke access
// @route   POST /api/handover/society/:id/demote
// @access  Private/SuperAdmin
exports.demoteAdmin = async (req, res) => {
    try {
        const { userId } = req.body;
        const societyId = req.params.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Remove society from array
        user.adminSocieties = user.adminSocieties.filter(id => id.toString() !== societyId.toString());
        
        // If they manage NO other societies, demote them completely to Student
        if (user.adminSocieties.length === 0) {
            user.role = 'Student';
        }
        await user.save();

        // Log the audit trail
        await HandoverLog.create({
            society: societyId,
            user: userId,
            action: 'Demoted to Student',
            performedBy: req.user._id
        });

        res.status(200).json({ success: true, message: 'User access revoked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
