const prisma = require('../config/database');

const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join a channel
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

                    // Load message history
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

        // Send a message
        socket.on('send_message', async (data) => {
            try {
                const channel = await prisma.channel.findFirst({
                    where: { name: data.channelName, workspaceId: 1 }
                });

                if (!channel) return;

                // Calculate expiration time
                let expiresAt = null;
                if (data.expiresIn) {
                    expiresAt = new Date(Date.now() + data.expiresIn * 1000);
                }

                // Save to database
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

                // Broadcast to channel
                io.to(channel.id.toString()).emit('receive_message', {
                    ...data,
                    channelId: channel.id,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });

            } catch (error) {
                console.error("Error saving message:", error);
            }
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log('User disconnected', socket.id);
        });
    });
};

module.exports = setupSocketHandlers;
