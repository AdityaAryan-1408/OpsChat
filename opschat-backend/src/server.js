const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client'); 
require('dotenv').config();
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient(); 

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
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
    const { email, username, name, age, gender, avatarId } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { email: email },
            data: {
                username,
                name,
                
            }
        });

        console.log(`Profile updated for: ${email}`);
        res.status(200).json({ success: true, user: updatedUser });

    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: "Username taken" });
        }
        console.error("Profile update error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and Password are required" });
    }

    try {

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword
            }
        });

        console.log(`New account created: ${email}`);
        res.status(201).json({ success: true, userId: newUser.id, email: newUser.email });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and Password are required" });
    }

    try {

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }


        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid email or password" });
        }


        const isProfileSetup = !!user.username;

        console.log(`User logged in: ${email}, Profile setup: ${isProfileSetup}`);
        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name
            },
            isProfileSetup
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_room', async (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);

        try {
            const pastMessages = await prisma.message.findMany({
                where: { room: room },
                orderBy: { createdAt: 'asc' },
                take: 50
            });

            socket.emit('load_history', pastMessages.map(msg => ({
                id: msg.id.toString(),
                room: msg.room,
                author: msg.author,
                message: msg.content,
                time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })));
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    });

    socket.on('send_message', async (data) => {
        try {
            const savedMessage = await prisma.message.create({
                data: {
                    content: data.message,
                    author: data.author,
                    room: data.room,
                }
            });

            console.log("Message saved to DB:", savedMessage.id);

            socket.to(data.room).emit('receive_message', data);

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