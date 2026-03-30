const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Society = require('../models/Society');

// @desc    Get all conversations & available societies for a student
// @route   GET /api/chat/student
// @access  Private (Student)
exports.getStudentChatSidebar = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Fetch existing conversations for this student
        const conversations = await Conversation.find({ student: studentId })
            .populate('society', 'name logo isActive')
            .sort({ updatedAt: -1 });

        // Fetch all active societies
        const activeSocieties = await Society.find({ isActive: true }).select('name logo isActive');

        // eparate them
        const activeChats = [];
        const activeSocietyIds = new Set(); // To filter out from New Chats

        conversations.forEach(conv => {
            if (conv.society) {
                activeChats.push({
                    conversationId: conv._id,
                    society: conv.society,
                    lastMessage: conv.lastMessage,
                    updatedAt: conv.updatedAt
                });
                activeSocietyIds.add(conv.society._id.toString());
            }
        });

        const newChats = activeSocieties.filter(soc => !activeSocietyIds.has(soc._id.toString()));

        res.status(200).json({
            success: true,
            activeChats,
            newChats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all conversations for a society admin
// @route   GET /api/chat/admin/:societyId
// @access  Private (Society Admin)
exports.getAdminChatSidebar = async (req, res) => {
    try {
        const { societyId } = req.params;

        const conversations = await Conversation.find({ society: societyId })
            .populate('student', 'name profilePic studentId')
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            conversations
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get messages for a specific conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });
        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Send a message (Creates conversation if it doesn't exist)
// @route   POST /api/chat/messages
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { societyId, text, senderType, conversationId } = req.body;
        const studentId = senderType === 'Student' ? req.user.id : req.body.studentId;

        let convId = conversationId;

        // If no conversationId provided, find or create one
        if (!convId) {
            let conversation = await Conversation.findOne({ student: studentId, society: societyId });
            if (!conversation) {
                conversation = await Conversation.create({
                    student: studentId,
                    society: societyId,
                    lastMessage: text
                });
            }
            convId = conversation._id;
        } else {
            // Update last message
            await Conversation.findByIdAndUpdate(convId, { lastMessage: text });
        }

        const message = await Message.create({
            conversation: convId,
            senderType,
            text
        });

        // Emit socket event if io is available
        const io = req.app.get('io');
        if (io) {
            io.to(convId.toString()).emit('receiveMessage', message);
            // Also notify sidebars
            io.to(convId.toString()).emit('updateSidebar', { conversationId: convId, lastMessage: text });
        }

        res.status(201).json({ success: true, message, conversationId: convId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get Society details for Info Modal
// @route   GET /api/chat/society-info/:societyId
// @access  Private
exports.getSocietyInfo = async (req, res) => {
    try {
        const society = await Society.findById(req.params.societyId).select('name logo category description email website isActive');
        if (!society) return res.status(404).json({ success: false, message: 'Society not found' });
        res.status(200).json({ success: true, society });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
