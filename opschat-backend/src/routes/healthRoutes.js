const express = require('express');
const prisma = require('../config/database');
const { pubClient } = require('../config/redis');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Readiness check
router.get('/ready', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        await pubClient.ping();

        res.status(200).json({
            status: 'ready',
            services: { database: 'up', redis: 'up' }
        });
    } catch (error) {
        console.error("Readiness Check Failed:", error);
        res.status(503).json({
            status: 'not ready',
            error: error.message
        });
    }
});

module.exports = router;
