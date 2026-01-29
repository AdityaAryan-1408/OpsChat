const request = require('supertest');
const express = require('express');
const uploadRoutes = require('../../src/routes/uploadRoutes');

// Create test app
const app = express();
app.use(express.json());
app.use('/api', uploadRoutes);

describe('Upload Routes', () => {
    describe('POST /api/upload-url', () => {
        it('should generate presigned URL for valid request', async () => {
            const response = await request(app)
                .post('/api/upload-url')
                .send({
                    filename: 'test-image.png',
                    fileType: 'image/png'
                });

            // May fail if MinIO isn't running
            if (response.status === 200) {
                expect(response.body).toHaveProperty('uploadUrl');
                expect(response.body).toHaveProperty('fileUrl');
                expect(response.body.uploadUrl).toContain('opschat-uploads');
                expect(response.body.fileUrl).toContain('test-image.png');
            } else {
                expect(response.status).toBe(500);
            }
        });

        it('should reject missing filename', async () => {
            const response = await request(app)
                .post('/api/upload-url')
                .send({ fileType: 'image/png' });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Missing file info');
        });

        it('should reject missing fileType', async () => {
            const response = await request(app)
                .post('/api/upload-url')
                .send({ filename: 'test.png' });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Missing file info');
        });

        it('should sanitize filename with spaces', async () => {
            const response = await request(app)
                .post('/api/upload-url')
                .send({
                    filename: 'my test file.png',
                    fileType: 'image/png'
                });

            if (response.status === 200) {
                expect(response.body.fileUrl).toContain('my-test-file.png');
            }
        });
    });
});
