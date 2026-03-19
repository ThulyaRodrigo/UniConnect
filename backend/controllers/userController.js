const User = require('../models/User');

// @desc    Search students by name, email, or studentId
// @route   GET /api/users/search?q=query
// @access  Private
exports.searchStudents = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.status(200).json({ success: true, data: [] });
        }

        // Create a regex for case-insensitive partial matching
        const regex = new RegExp(q, 'i');

        const students = await User.find({
            role: { $in: ['Student', 'SocietyAdmin'] }, // Allow admins to be assigned tickets too
            $or: [
                { name: regex },
                { email: regex },
                { studentId: regex }
            ]
        })
        .select('name email studentId')
        .limit(10)
        .lean();

        res.status(200).json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
