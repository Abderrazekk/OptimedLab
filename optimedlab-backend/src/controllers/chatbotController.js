const axios = require('axios');

// @desc    Forward user message to Python chatbot and return reply
// @route   POST /api/chatbot/message
// @access  Private (if you want to restrict, add auth middleware)
const handleChatMessage = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Python chatbot service URL (adjust if running on different host/port)
    const pythonApiUrl = process.env.CHATBOT_URL || 'http://localhost:8000/chat';

    const response = await axios.post(pythonApiUrl, {
      message: message,
      // If your Python API expects additional fields, add them here
      // e.g., user_id: req.user._id, ticket_id: 'some-id'
    });

    // Assuming Python returns { "reply": "answer" }
    const reply = response.data.reply;

    res.json({ reply });
  } catch (error) {
    console.error('Chatbot proxy error:', error.message);
    res.status(500).json({ error: 'Failed to get response from chatbot' });
  }
};

module.exports = { handleChatMessage };