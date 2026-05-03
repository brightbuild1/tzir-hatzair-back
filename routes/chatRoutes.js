const express = require('express');
const router = express.Router();
const { chat } = require('../services/chatService');

// POST /api/v1/chat
router.post('/chat', async (req, res) => {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'messages array is required.' });
    }

    // validate message format
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user' || !lastMessage.content) {
        return res.status(400).json({ error: 'Last message must be a user message with content.' });
    }

    try {
        const reply = await chat(messages);
        return res.status(200).json(reply);
    } catch (error) {
        console.error('Chat Error:', error.message);

        if (error.status === 429) {
            return res.status(429).json({ error: 'שירות הצ׳אט עמוס כרגע, נסה שוב בעוד כמה שניות.' });
        }

        return res.status(500).json({ error: 'שגיאה בשירות הצ׳אט. נסה שוב מאוחר יותר.' });
    }
});

module.exports = router;
