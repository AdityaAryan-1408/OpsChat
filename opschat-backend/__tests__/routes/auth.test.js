const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/authRoutes');
const prisma = require('../../src/config/database');

// Create test app
const app = express();
app.use(express.json());
app.use('/api', authRoutes);

// Test user data
const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!'
};

describe('Auth Routes', () => {
    afterAll(async () => {
        // Cleanup test user
        try {
            await prisma.user.delete({
                where: { email: testUser.email }
            });
        } catch (e) {
            // User might not exist
        }
    });

    describe('POST /api/signup', () => {
        it('should create a new user', async () => {
            const response = await request(app)
                .post('/api/signup')
                .send(testUser);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('userId');
            expect(response.body).toHaveProperty('email', testUser.email);
        });

        it('should reject duplicate email', async () => {
            const response = await request(app)
                .post('/api/signup')
                .send(testUser);

            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('error', 'Email already exists');
        });

        it('should reject missing fields', async () => {
            const response = await request(app)
                .post('/api/signup')
                .send({ email: 'test@test.com' });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Required fields missing');
        });
    });

    describe('POST /api/login', () => {
        it('should login existing user', async () => {
            const response = await request(app)
                .post('/api/login')
                .send(testUser);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', testUser.email);
        });

        it('should reject invalid password', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({ email: testUser.email, password: 'wrongpassword' });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid credentials');
        });

        it('should reject non-existent user', async () => {
            const response = await request(app)
                .post('/api/login')
                .send({ email: 'nonexistent@test.com', password: 'password' });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid credentials');
        });
    });

    describe('POST /api/check-username', () => {
        it('should return available for new username', async () => {
            const response = await request(app)
                .post('/api/check-username')
                .send({ username: `newuser-${Date.now()}` });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('available', true);
        });
    });
});
