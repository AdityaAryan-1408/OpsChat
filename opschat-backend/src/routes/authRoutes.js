const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

const router = express.Router();

// Check username availability
router.post('/check-username', async (req, res) => {
    const { username } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (user) return res.status(409).json({ available: false });
        res.status(200).json({ available: true });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Update profile
router.post('/update-profile', async (req, res) => {
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

// Signup
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Required fields missing" });

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(409).json({ error: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: { email, password: hashedPassword }
        });

        // Auto-join default workspace
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

// Login
router.post('/login', async (req, res) => {
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

module.exports = router;
