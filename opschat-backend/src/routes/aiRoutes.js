const express = require('express');
const groq = require('../config/groq');

const router = express.Router();

// AI Summarization
router.post('/summarize', async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Invalid messages" });

    try {
        const context = messages.join("\n");

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful project manager assistant. Summarize the following chat conversation into 2-3 concise sentences. Focus on key decisions and action items."
                },
                {
                    role: "user",
                    content: context
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
        });

        const summary = completion.choices[0]?.message?.content || "Could not generate summary.";
        res.json({ summary });

    } catch (error) {
        console.error("Groq API Error:", error);
        res.status(500).json({ error: "AI service failed" });
    }
});

// AI Translation
router.post('/translate', async (req, res) => {
    const { text, lang } = req.body;
    if (!text || !lang) return res.status(400).json({ error: "Missing parameters" });

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a professional translator. Translate the following text into ${lang}. Output ONLY the translated text, no explanations.`
                },
                {
                    role: "user",
                    content: text
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.3,
        });

        const translation = completion.choices[0]?.message?.content || text;
        res.json({ translation });

    } catch (error) {
        console.error("Groq API Error:", error);
        res.status(500).json({ error: "Translation failed" });
    }
});

module.exports = router;
