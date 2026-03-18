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
