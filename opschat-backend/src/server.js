const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');
const { S3Client, CreateBucketCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();


const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();


const s3Client = new S3Client({
    region: "us-east-1",
    endpoint: "http://127.0.0.1:9000",
    forcePathStyle: true,
    credentials: {
        accessKeyId: "admin",
        secretAccessKey: "password123"
    }
});


async function startServer() {

    await Promise.all([pubClient.connect(), subClient.connect()]);
    console.log("Redis Connected");

    // Initialize MinIO bucket
    try {
        await s3Client.send(new CreateBucketCommand({ Bucket: "opschat-uploads" }));
        console.log("MinIO Bucket 'opschat-uploads' created");
    } catch (err) {
        if (err.name === 'BucketAlreadyOwnedByYou' || err.name === 'BucketAlreadyExists') {
            console.log("MinIO Bucket 'opschat-uploads' already exists");
        } else {
            console.error("MinIO Bucket creation error:", err.message);
        }
    }

    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"]
        },
        adapter: createAdapter(pubClient, subClient)
    });

    app.use(cors());
    app.use(express.json());

    app.post('/api/upload-url', async (req, res) => {
        const { filename, fileType } = req.body;
        if (!filename || !fileType) return res.status(400).json({ error: "Missing file info" });

        const cleanFilename = filename.replace(/\s+/g, '-');
        const uniqueKey = `${Date.now()}-${cleanFilename}`;

        try {
            const command = new PutObjectCommand({
                Bucket: "opschat-uploads",
                Key: uniqueKey,
                ContentType: fileType,
            });

            const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
            const fileUrl = `http://localhost:9000/opschat-uploads/${uniqueKey}`;

            res.json({ uploadUrl, fileUrl });
        } catch (error) {
            console.error("Presigned URL Error:", error);
            res.status(500).json({ error: "Failed to generate upload URL" });
        }
    });
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', uptime: process.uptime() });
    });

    app.get('/ready', async (req, res) => {
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

    app.post('/api/check-username', async (req, res) => {
        const { username } = req.body;
        try {
            const user = await prisma.user.findUnique({ where: { username } });
            if (user) return res.status(409).json({ available: false });
            res.status(200).json({ available: true });
        } catch (error) {
            res.status(500).json({ error: "Server error" });
        }
    });

    app.post('/api/update-profile', async (req, res) => {
        const { email, username, name } = req.body;
        try {
            const updatedUser = await prisma.user.update({
                where: { email: email },
                data: { username, name }
            });
            console.log(`Profile updated for: ${email}`);
            res.status(200).json({ success: true, user: updatedUser });
        } catch (error) {
            if (error.code === 'P2002') return res.status(409).json({ error: "Username taken" });
            console.error("Profile update error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    app.post('/api/signup', async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Required fields missing" });

        try {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) return res.status(409).json({ error: "Email already exists" });

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await prisma.user.create({
                data: { email, password: hashedPassword }
            });


            try {
                await prisma.workspaceMember.create({
                    data: { userId: newUser.id, workspaceId: 1, role: 'MEMBER' }
                });
            } catch (err) { }

            console.log(`New account created: ${email}`);
            res.status(201).json({ success: true, userId: newUser.id, email: newUser.email });

        } catch (error) {
            console.error("Signup error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    app.post('/api/login', async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Required fields missing" });

        try {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) return res.status(401).json({ error: "Invalid credentials" });

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) return res.status(401).json({ error: "Invalid credentials" });

            const isProfileSetup = !!user.username;
            console.log(`User logged in: ${email}`);

            res.status(200).json({
                success: true,
                user: { id: user.id, email: user.email, username: user.username, name: user.name },
                isProfileSetup
            });

        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);


        socket.on('join_channel', async ({ channelName, workspaceId = 1 }) => {
            try {

                const channel = await prisma.channel.findFirst({
                    where: {
                        name: channelName,
                        workspaceId: workspaceId
                    }
                });

                if (channel) {
                    socket.join(channel.id.toString());
                    console.log(`User ${socket.id} joined channel ID: ${channel.id}`);


                    const pastMessages = await prisma.message.findMany({
                        where: {
                            channelId: channel.id,
                            OR: [
                                { expiresAt: null },
                                { expiresAt: { gt: new Date() } }
                            ]
                        },
                        orderBy: { createdAt: 'asc' },
                        take: 50,
                        include: { user: true }
                    });

                    socket.emit('load_history', pastMessages.map(msg => ({
                        id: msg.id.toString(),
                        channelId: msg.channelId,
                        author: msg.author || msg.user?.username || "Unknown",
                        message: msg.content,
                        type: msg.type || 'text',
                        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    })));
                } else {
                    socket.emit('error', 'Channel not found');
                }
            } catch (error) {
                console.error("Error joining channel:", error);
            }
        });


        socket.on('send_message', async (data) => {
            try {

                const channel = await prisma.channel.findFirst({
                    where: { name: data.channelName, workspaceId: 1 }
                });

                if (!channel) return;


                let expiresAt = null;
                if (data.expiresIn) {

                    expiresAt = new Date(Date.now() + data.expiresIn * 1000);
                }

                const savedMessage = await prisma.message.create({
                    data: {
                        content: data.message,
                        author: data.author,
                        type: data.type || 'text',
                        channelId: channel.id,
                        userId: data.userId ? parseInt(data.userId) : null,
                        expiresAt: expiresAt
                    }
                });


                io.to(channel.id.toString()).emit('receive_message', {
                    ...data,
                    channelId: channel.id,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });

            } catch (error) {
                console.error("Error saving message:", error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected', socket.id);
        });
    });

    const port = process.env.PORT || 3001;
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

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