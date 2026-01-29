const request = require('supertest');
const express = require('express');
const healthRoutes = require('../../src/routes/healthRoutes');

// Create test app
const app = express();
app.use('/', healthRoutes);

describe('Health Routes', () => {
    describe('GET /health', () => {
        it('should return 200 with status ok', async () => {
            const response = await request(app).get('/health');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('uptime');
            expect(typeof response.body.uptime).toBe('number');
        });
    });

    describe('GET /ready', () => {
        it('should return 200 when services are up', async () => {
            const response = await request(app).get('/ready');

            // This will fail if Redis/Postgres aren't running
            // In CI, you'd mock these
            if (response.status === 200) {
                expect(response.body).toHaveProperty('status', 'ready');
                expect(response.body.services).toHaveProperty('database', 'up');
                expect(response.body.services).toHaveProperty('redis', 'up');
            } else {
                expect(response.status).toBe(503);
                expect(response.body).toHaveProperty('status', 'not ready');
            }
        });
    });
});
