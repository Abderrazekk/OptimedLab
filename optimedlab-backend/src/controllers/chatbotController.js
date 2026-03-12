const axios = require("axios");

const handleChatMessage = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const pythonApiUrl =
      process.env.CHATBOT_URL || "http://localhost:8000/chat";
    const authHeader = req.headers.authorization; // "Bearer <token>"

    const response = await axios.post(
      pythonApiUrl,
      { message },
      { headers: { Authorization: authHeader } },
    );

    res.json(response.data);
  } catch (error) {
    console.error("Chatbot proxy error:", error.message);
    res.status(500).json({ error: "Failed to get response from chatbot" });
  }
};

module.exports = { handleChatMessage };
