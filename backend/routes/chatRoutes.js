const express = require('express');
const router = express.Router();
const {
    getStudentChatSidebar,
    getAdminChatSidebar,
    getMessages,
    sendMessage,
    getSocietyInfo
} = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/student', protect, getStudentChatSidebar);
router.get('/admin/:societyId', protect, getAdminChatSidebar);
router.get('/messages/:conversationId', protect, getMessages);
router.post('/messages', protect, sendMessage);
router.get('/society-info/:societyId', protect, getSocietyInfo);

module.exports = router;
