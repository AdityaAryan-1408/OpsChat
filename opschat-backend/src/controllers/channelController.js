const prisma = require('../config/database');

// Create a new Channel  
const createChannel = async (req, res) => {
    try {
        const { name, workspaceId } = req.body;
        const userId = req.user.userId;

        // Ensure the workspace exists
        const workspace = await prisma.workspace.findUnique({
            where: { id: parseInt(workspaceId) }
        });

        if (!workspace) {
            return res.status(404).json({ error: "Workspace not found" });
        }

        // Create channel with creator
        const channel = await prisma.channel.create({
            data: {
                name: name.trim().toLowerCase().replace(/\s+/g, '-'),
                workspaceId: parseInt(workspaceId),
                creatorId: userId,
                // Also add creator as first member
                members: {
                    create: {
                        userId: userId,
                        role: 'CREATOR'
                    }
                }
            }
        });

        // Return channel with invite code visible to creator
        res.status(201).json({
            ...channel,
            inviteCode: channel.inviteCode, // Explicitly include invite code
            message: "Channel created! Share this invite code with others to join."
        });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "Channel name already exists in this workspace" });
        }
        console.error("Create Channel Error:", error);
        res.status(500).json({ error: "Failed to create channel" });
    }
};

// Join a Channel via Invite Code - adds user as member
const joinChannel = async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const userId = req.user.userId;

        // Find channel by code
        const channel = await prisma.channel.findUnique({
            where: { inviteCode },
            include: { members: true }
        });

        if (!channel) {
            return res.status(404).json({ error: "Invalid invite code" });
        }

        // Check if user is already a member of the channel
        const existingMember = await prisma.channelMember.findUnique({
            where: {
                userId_channelId: {
                    userId,
                    channelId: channel.id
                }
            }
        });

        if (existingMember) {
            return res.status(200).json({
                message: "You are already a member of this channel",
                channel
            });
        }

        // Add user to the channel
        await prisma.channelMember.create({
            data: {
                userId,
                channelId: channel.id,
                role: 'MEMBER'
            }
        });

        res.status(200).json({
            message: "Successfully joined channel!",
            channel: {
                id: channel.id,
                name: channel.name
            }
        });

    } catch (error) {
        console.error("Join Channel Error:", error);
        res.status(500).json({ error: "Failed to join channel" });
    }
};

// Get all channels user is a member of (not global anymore!)
const getChannels = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user.userId;

        // Only get channels where user is a member
        const channels = await prisma.channel.findMany({
            where: {
                workspaceId: parseInt(workspaceId),
                members: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                members: {
                    select: { userId: true, role: true }
                },
                _count: {
                    select: { members: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Add isCreator flag and member count
        const channelsWithMeta = channels.map(channel => ({
            id: channel.id,
            name: channel.name,
            inviteCode: channel.creatorId === userId ? channel.inviteCode : undefined,
            memberCount: channel._count.members,
            isCreator: channel.creatorId === userId
        }));

        res.json(channelsWithMeta);
    } catch (error) {
        console.error("Get Channels Error:", error);
        res.status(500).json({ error: "Failed to fetch channels" });
    }
};

// Update a channel name (only creator can update)
const updateChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { name } = req.body;
        const userId = req.user.userId;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: "Channel name is required" });
        }

        // Check if user is creator
        const channel = await prisma.channel.findUnique({
            where: { id: parseInt(channelId) }
        });

        if (!channel) {
            return res.status(404).json({ error: "Channel not found" });
        }

        if (channel.creatorId !== userId) {
            return res.status(403).json({ error: "Only the channel creator can edit this channel" });
        }

        const updatedChannel = await prisma.channel.update({
            where: { id: parseInt(channelId) },
            data: { name: name.trim().toLowerCase().replace(/\s+/g, '-') }
        });

        res.json(updatedChannel);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "Channel name already exists in this workspace" });
        }
        console.error("Update Channel Error:", error);
        res.status(500).json({ error: "Failed to update channel" });
    }
};

// Delete a channel (only creator can delete)
const deleteChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const userId = req.user.userId;

        // Check if user is creator
        const channel = await prisma.channel.findUnique({
            where: { id: parseInt(channelId) }
        });

        if (!channel) {
            return res.status(404).json({ error: "Channel not found" });
        }

        if (channel.creatorId !== userId) {
            return res.status(403).json({ error: "Only the channel creator can delete this channel" });
        }

        // Delete channel (messages and members cascade delete)
        await prisma.channel.delete({
            where: { id: parseInt(channelId) }
        });

        res.json({ message: "Channel deleted successfully" });
    } catch (error) {
        console.error("Delete Channel Error:", error);
        res.status(500).json({ error: "Failed to delete channel" });
    }
};

// Get channel invite code (only for creator)
const getInviteCode = async (req, res) => {
    try {
        const { channelId } = req.params;
        const userId = req.user.userId;

        const channel = await prisma.channel.findUnique({
            where: { id: parseInt(channelId) }
        });

        if (!channel) {
            return res.status(404).json({ error: "Channel not found" });
        }

        // Check if user is member
        const member = await prisma.channelMember.findUnique({
            where: {
                userId_channelId: { userId, channelId: parseInt(channelId) }
            }
        });

        if (!member) {
            return res.status(403).json({ error: "You are not a member of this channel" });
        }

        // Only creator can see invite code
        if (channel.creatorId !== userId) {
            return res.status(403).json({ error: "Only the channel creator can view the invite code" });
        }

        res.json({ inviteCode: channel.inviteCode });
    } catch (error) {
        console.error("Get Invite Code Error:", error);
        res.status(500).json({ error: "Failed to get invite code" });
    }
};

module.exports = {
    createChannel,
    joinChannel,
    getChannels,
    updateChannel,
    deleteChannel,
    getInviteCode
};