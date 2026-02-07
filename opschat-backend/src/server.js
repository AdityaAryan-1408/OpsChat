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

// Route imports - Using the index.js barrel file
const {
    authRoutes,
    uploadRoutes,
    aiRoutes,
    healthRoutes,
    friendRoutes,
    channelRoutes,
    userRoutes
} = require('./routes');

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
            origin: [
                process.env.CLIENT_URL || 'http://localhost:5173',
                'http://localhost:8080'
            ],
            methods: ["GET", "POST"]
        },
        adapter: createAdapter(pubClient, subClient)
    });

    // Make io accessible in routes
    app.set('io', io);

    // CORS Configuration - Allow both local dev and container environments
    const allowedOrigins = [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'http://localhost:8080',
        'http://localhost',
        'http://127.0.0.1',
        'http://localhost:80'
    ];
    
    // Middleware
    app.use(cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps, curl, etc.)
            if (!origin) return callback(null, true);
            
            // Allow any localhost/127.0.0.1 origin
            if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                return callback(null, true);
            }
            
            if (allowedOrigins.indexOf(origin) !== -1) {
                return callback(null, true);
            }
            
            return callback(null, true); // In dev, allow all. In prod, restrict this.
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
    }));
    app.use(express.json());

    // Routes
    app.use('/api', authRoutes);
    app.use('/api', uploadRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/friends', friendRoutes);
    app.use('/api/channels', channelRoutes);
    app.use('/api/users', userRoutes);
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