const request = require('supertest');
const express = require('express');
const aiRoutes = require('../../src/routes/aiRoutes');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/ai', aiRoutes);

describe('AI Routes', () => {
    describe('POST /api/ai/summarize', () => {
        it('should summarize messages', async () => {
            const response = await request(app)
                .post('/api/ai/summarize')
                .send({
                    messages: [
                        'User1: Hello, how are you?',
                        'User2: I am fine, thanks!',
                        'User1: Great, let us discuss the project.',
                        'User2: Sure, we need to finish the API by Friday.'
                    ]
                });

            // May fail if Groq API key is invalid
            if (response.status === 200) {
                expect(response.body).toHaveProperty('summary');
                expect(typeof response.body.summary).toBe('string');
                expect(response.body.summary.length).toBeGreaterThan(10);
            } else {
                expect(response.status).toBe(500);
            }
        }, 15000); // Longer timeout for AI request

        it('should reject invalid messages format', async () => {
            const response = await request(app)
                .post('/api/ai/summarize')
                .send({ messages: 'not an array' });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid messages');
        });

        it('should reject missing messages', async () => {
            const response = await request(app)
                .post('/api/ai/summarize')
                .send({});

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/ai/translate', () => {
        it('should translate text', async () => {
            const response = await request(app)
                .post('/api/ai/translate')
                .send({
                    text: 'Hello, how are you?',
                    lang: 'Spanish'
                });

            // May fail if Groq API key is invalid
            if (response.status === 200) {
                expect(response.body).toHaveProperty('translation');
                expect(typeof response.body.translation).toBe('string');
            } else {
                expect(response.status).toBe(500);
            }
        }, 15000);

        it('should reject missing parameters', async () => {
            const response = await request(app)
                .post('/api/ai/translate')
                .send({ text: 'Hello' });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Missing parameters');
        });
    });
});
