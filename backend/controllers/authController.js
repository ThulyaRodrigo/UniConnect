const User = require('../models/User');
const Society = require('../models/Society');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper to generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token lasts for 30 days
    });
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, studentId } = req.body;

        if (!name || !email || !password || !studentId) {
            return res.status(400).json({ message: 'Please add all fields including student ID' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user (Strictly enforced as 'Student')
        const user = await User.create({
            name,
            email,
            studentId,
            password: hashedPassword,
            role: 'Student', 
            adminSocieties: []
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePic: user.profilePic || '',
                adminSocieties: user.adminSocieties,
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user by email or studentId and explicitly select the password field (since it's hidden by default)
        // Populate the adminSocieties so the frontend workspace switcher has the names ready!
        // populated 'adminSocieties' makes frontend dropdown ready!
        const user = await User.findOne({ $or: [{ email }, { studentId: email }] })
            .select('+password')
            .populate('adminSocieties', 'name category'); 

        // Block login if deactivated
        if (user && user.isActive === false) {
            return res.status(403).json({ message: 'Your account has been deactivated. Please contact support(admin@sliit.lk) to reactivate.' });
        }

        // Check password match
        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(200).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePic: user.profilePic || '',
                adminSocieties: user.adminSocieties, // Frontend uses this for the dropdown
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};