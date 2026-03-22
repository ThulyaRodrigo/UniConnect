const express = require('express');
const router = express.Router();
const { 
    searchStudents, getUserProfile, updateProfile, updatePassword,
    assignSocietyRole, revokeSocietyRole 
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // CLOUDINARY MIDDLEWARE

router.get('/search', protect, searchStudents);

// Profile Management
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('profilePic'), updateProfile);
router.put('/password', protect, updatePassword);

// Super Admin Role Management
router.post('/roles/assign', protect, authorize('SuperAdmin'), assignSocietyRole);
router.put('/roles/revoke', protect, authorize('SuperAdmin'), revokeSocietyRole);

module.exports = router;