const User = require('../models/User');
const HandoverLog = require('../models/HandoverLog');
const Society = require('../models/Society');

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
        const society = await Society.findById(req.params.id)
            .populate('board.user', 'name email role'); // Fetch user details for the board
        
        res.status(200).json({ success: true, data: society.board });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Promote student to Society Admin
// @route   POST /api/handover/society/:id/promote
// @access  Private/SuperAdmin
exports.promoteAdmin = async (req, res) => {
    try {
        const { userId, position } = req.body; // Now expecting 'position'
        const societyId = req.params.id;

        if (!position) {
            return res.status(400).json({ message: 'Please specify the board position.' });
        }

        const user = await User.findById(userId);
        const society = await Society.findById(societyId);

        if (!user || !society) return res.status(404).json({ message: 'User or Society not found' });

        // UNIQUE POSITION CONSTRAINT CHECK
        const isPositionTaken = society.board.some(member => member.position === position);
        if (isPositionTaken) {
            return res.status(400).json({ 
                message: `This society already has a ${position}. Please revoke the current ${position}'s access first.` 
            });
        }

        // Prevent user from holding multiple roles in the SAME society
        const isAlreadyOnBoard = society.board.some(member => member.user.toString() === userId.toString());
        if (isAlreadyOnBoard) {
            return res.status(400).json({ message: 'This student is already on the board for this society.' });
        }

        // Update the Society's Board
        society.board.push({ user: userId, position: position });
        await society.save();

        // Update the User's Privileges
        if (!user.adminSocieties.includes(societyId)) {
            user.adminSocieties.push(societyId);
        }
        user.role = 'SocietyAdmin';
        await user.save();

        // Log the audit trail
        await HandoverLog.create({
            society: societyId,
            user: userId,
            action: `Promoted to ${position}`, // Log the specific role!
            performedBy: req.user._id 
        });

        res.status(200).json({ success: true, message: `Student successfully promoted to ${position}!` });
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
        const society = await Society.findById(societyId);

        // Find what position they held for the log
        const boardMember = society.board.find(member => member.user.toString() === userId.toString());
        const previousPosition = boardMember ? boardMember.position : 'Admin';

        // Remove from Society Board
        society.board = society.board.filter(member => member.user.toString() !== userId.toString());
        await society.save();

        // Remove from User's workspaces
        if (user) {
            user.adminSocieties = user.adminSocieties.filter(id => id.toString() !== societyId.toString());
            if (user.adminSocieties.length === 0) {
                user.role = 'Student'; // Completely demote if they manage nothing else
            }
            await user.save();
        }

        // Log the audit trail
        await HandoverLog.create({
            society: societyId,
            user: userId,
            action: `Revoked ${previousPosition} access`,
            performedBy: req.user._id
        });

        res.status(200).json({ success: true, message: 'Access revoked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get Audit Trail History for a society
// @route   GET /api/handover/society/:id/history
// @access  Private/SuperAdmin
exports.getHandoverHistory = async (req, res) => {
    try {
        const history = await HandoverLog.find({ society: req.params.id })
            .populate('user', 'name email')
            .populate('performedBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};