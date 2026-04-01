const express = require('express');
const router = express.Router();
const {
    getStudentChatSidebar,
    getAdminChatSidebar,
    getMessages,
    sendMessage,
    getSocietyInfo,
    searchStudents,
    uploadChatImage
} = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');
const chatUpload = require('../middlewares/chatUploadMiddleware');

router.get('/student', protect, getStudentChatSidebar);
router.get('/admin/search-students', protect, searchStudents);
router.get('/admin/:societyId', protect, getAdminChatSidebar);
router.get('/messages/:conversationId', protect, getMessages);
router.post('/messages', protect, sendMessage);
router.post('/upload-image', protect, chatUpload.single('image'), uploadChatImage);
router.get('/society-info/:societyId', protect, getSocietyInfo);

module.exports = router;
