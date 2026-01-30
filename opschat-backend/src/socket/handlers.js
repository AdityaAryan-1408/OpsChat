const prisma = require('../config/database');

const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join a channel 
        socket.on('join_channel', async ({ room, channelId }) => {
            try {
                const rooms = [...socket.rooms];
                rooms.forEach(r => {
                    if (r !== socket.id) {
                        socket.leave(r);
                    }
                });

                if (channelId) {
                    const channel = await prisma.channel.findUnique({
                        where: { id: parseInt(channelId) }
                    });

                    if (!channel) {
                        socket.emit('error', 'Channel not found');
                        return;
                    }

                    const roomName = `channel_${channel.id}`;
                    socket.join(roomName);
                    console.log(`User ${socket.id} joined room: ${roomName}`);

                    // Load message history for this channel
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
                } else if (room) {
                    socket.join(room);
                    console.log(`User ${socket.id} joined room: ${room}`);
                    socket.emit('load_history', []);
                }
            } catch (error) {
                console.error("Error joining channel:", error);
                socket.emit('error', 'Failed to join channel');
            }
        });

        // Send a message 
        socket.on('send_message', async (data) => {
            try {
                const { message, author, channelId, type, expiresIn } = data;

                if (!channelId) {
                    console.error("No channelId provided for message");
                    return;
                }

                const channel = await prisma.channel.findUnique({
                    where: { id: parseInt(channelId) }
                });

                if (!channel) {
                    console.error(`Channel ${channelId} not found`);
                    return;
                }

                // Calculate expiration time
                let expiresAt = null;
                if (expiresIn) {
                    expiresAt = new Date(Date.now() + expiresIn * 1000);
                }

                // Save to database
                const savedMessage = await prisma.message.create({
                    data: {
                        content: message,
                        author: author,
                        type: type || 'text',
                        channelId: channel.id,
                        userId: data.userId ? parseInt(data.userId) : null,
                        expiresAt: expiresAt
                    }
                });

                const roomName = `channel_${channel.id}`;

                // Broadcast to channel room
                io.to(roomName).emit('receive_message', {
                    id: savedMessage.id.toString(),
                    message: message,
                    author: author,
                    type: type || 'text',
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
