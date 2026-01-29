const prisma = require('../config/database');

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                bio: true,
                avatar: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, bio } = req.body;

        // Validation (Basic)
        if (bio && bio.length > 500) {
            return res.status(400).json({ error: "Bio must be less than 500 characters" });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                bio
            },
            select: {
                id: true,
                username: true,
                name: true,
                bio: true,
                avatar: true
            }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
};

module.exports = {
    getProfile,
    updateProfile
};