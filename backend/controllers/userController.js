const User = require('../models/User');
const Society = require('../models/Society');
const HandoverLog = require('../models/HandoverLog');
const bcrypt = require('bcryptjs');

// @desc    Search students by name, email, or studentId
// @route   GET /api/users/search?q=query
// @access  Private
exports.searchStudents = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) return res.status(200).json({ success: true, data: [] });

        const regex = new RegExp(q, 'i');
        const students = await User.find({
            role: { $in: ['Student', 'SocietyAdmin'] },
            $or: [{ name: regex }, { email: regex }, { studentId: regex }]
        }).select('name email studentId profilePic').limit(10).lean();

        res.status(200).json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get Current User Profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('adminSocieties', 'name category');
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update Profile Info & Picture
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.body.name) user.name = req.body.name;
        if (req.body.phone !== undefined) user.phone = req.body.phone;
        if (req.body.bio !== undefined) user.bio = req.body.bio;
        
        // If the multer middleware uploaded a new image to Cloudinary
        if (req.file) {
            user.profilePic = req.file.path;
        }

        await user.save();

        // Return updated user (excluding password)
        const updatedUser = await User.findById(req.user._id).populate('adminSocieties', 'name');
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update Password
// @route   PUT /api/users/password
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid current password' });
        }

        // Hash and save new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


// SUPER ADMIN ROLE MANAGEMENT

// @desc    Assign a student to a Society Admin role
exports.assignSocietyRole = async (req, res) => {
    try {
        const { targetUserId, societyId, roleTitle } = req.body; // roleTitle MUST be one of the Enums (e.g. 'President')

        const user = await User.findById(targetUserId);
        const society = await Society.findById(societyId);

        if (!user || !society) return res.status(404).json({ message: 'User or Society not found' });

        // Update User Document
        if (!user.adminSocieties.includes(societyId)) user.adminSocieties.push(societyId);
        if (user.role === 'Student') user.role = 'SocietyAdmin';
        
        user.leadershipHistory.push({
            society: society._id,
            societyName: society.name,
            role: roleTitle,
            startDate: new Date(),
            status: 'Active'
        });
        await user.save();

        // Update Society Document (Add to Board Array)
        // Prevent duplicates
        const existingBoardMember = society.board.find(b => b.user.toString() === targetUserId);
        if (!existingBoardMember) {
            society.board.push({ user: targetUserId, position: roleTitle });
            await society.save();
        }

        // Add to Immutable Handover Log
        await HandoverLog.create({
            society: society._id, user: user._id,
            action: `Assigned as ${roleTitle}`, performedBy: req.user._id
        });

        res.status(200).json({ success: true, message: 'Role assigned successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Revoke or Complete a Society Admin role
exports.revokeSocietyRole = async (req, res) => {
    try {
        const { targetUserId, societyId, endStatus } = req.body; 

        const user = await User.findById(targetUserId);
        const society = await Society.findById(societyId);
        if (!user || !society) return res.status(404).json({ message: 'User or Society not found' });

        // Update User Document
        user.adminSocieties = user.adminSocieties.filter(id => id.toString() !== societyId.toString());
        if (user.adminSocieties.length === 0 && user.role !== 'SuperAdmin') user.role = 'Student';

        const activeRecordIndex = user.leadershipHistory.findLastIndex(
            record => record.society.toString() === societyId.toString() && record.status === 'Active'
        );
        if (activeRecordIndex !== -1) {
            user.leadershipHistory[activeRecordIndex].endDate = new Date();
            user.leadershipHistory[activeRecordIndex].status = endStatus; 
        }
        await user.save();

        // Update Society Document (Remove from Board Array)
        society.board = society.board.filter(b => b.user.toString() !== targetUserId);
        await society.save();

        // Add to Handover Log
        await HandoverLog.create({
            society: societyId, user: user._id,
            action: endStatus === 'Revoked' ? 'Role Revoked' : 'Term Completed', performedBy: req.user._id
        });

        res.status(200).json({ success: true, message: `Role ${endStatus.toLowerCase()} successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};