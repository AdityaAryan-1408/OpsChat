require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createAdapter } = require('@socket.io/redis-adapter');

// Config imports
const prisma = require('./config/database');
const { pubClient, subClient, connectRedis } = require('./config/redis');
const { initializeBucket } = require('./config/s3');

// Route imports
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const aiRoutes = require('./routes/aiRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Socket handlers
const setupSocketHandlers = require('./socket/handlers');

// Initialize Express
const app = express();
const server = http.createServer(app);

async function startServer() {
    // Connect to Redis
    await connectRedis();

    // Initialize MinIO bucket
    await initializeBucket();

    // Setup Socket.io with Redis adapter
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ["GET", "POST"]
        },
        adapter: createAdapter(pubClient, subClient)
    });

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Routes
    app.use('/api', authRoutes);
    app.use('/api', uploadRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/', healthRoutes);

    // Socket handlers
    setupSocketHandlers(io);

    // Start server
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
        console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);

        setTimeout(() => {
            console.error('   ⚠️  Shutdown timed out. Forcefully exiting.');
            process.exit(1);
        }, 5000);

        server.close(async () => {
            console.log('   ✅ Http server closed.');

            try {
                if (pubClient.isOpen) await pubClient.disconnect();
                if (subClient.isOpen) await subClient.disconnect();
                console.log('   ✅ Redis connections closed.');

                await prisma.$disconnect();
                console.log('   ✅ Database connection closed.');

                console.log('👋 Goodbye!');
                process.exit(0);
            } catch (err) {
                console.error('   ❌ Error during shutdown:', err);
                process.exit(1);
            }
        });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();