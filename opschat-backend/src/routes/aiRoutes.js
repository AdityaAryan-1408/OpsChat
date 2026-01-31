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

// AI Smart Replies
router.post('/suggest-replies', async (req, res) => {
    const { context } = req.body;
    if (!context || !Array.isArray(context) || context.length === 0) return res.status(400).json({ error: "Invalid context" });

    try {
        const conversation = context.slice(-5).join("\n"); // Last 5 messages

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a helpful chat assistant. Read the following conversation and generate 3 short, concise, and natural responses that the last user could respond with. 
                    - Keep them casual but professional.
                    - Max 5-10 words each.
                    - Output completely valid JSON array of strings ONLY. Example: ["Sounds good!", "I'll check it."]
                    - Do not include any markdown or explanations.`
                },
                {
                    role: "user",
                    content: conversation
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.6,

        });

        const raw = completion.choices[0]?.message?.content?.trim();
        const jsonStr = raw.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();

        const suggestions = JSON.parse(jsonStr);
        res.json({ suggestions });

    } catch (error) {
        console.error("Groq Smart Reply Error:", error);
        res.json({ suggestions: ["👍", "Sounds good", "Can you clarify?"] });
    }
});

module.exports = router;
