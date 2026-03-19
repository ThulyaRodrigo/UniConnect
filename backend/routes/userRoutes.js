const express = require('express');
const router = express.Router();
const { searchStudents } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/search', protect, searchStudents);

module.exports = router;
