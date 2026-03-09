const express = require('express');
const { handleChatMessage } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware'); // optional: protect route

const router = express.Router();

// If you want only authenticated users to access the chatbot
// router.post('/message', protect, handleChatMessage);
router.post('/message', handleChatMessage); // public for now

module.exports = router;