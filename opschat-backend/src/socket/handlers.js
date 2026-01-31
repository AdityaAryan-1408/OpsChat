const prisma = require('../config/database');

const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join a channel or DM room
        socket.on('join_channel', async ({ room, channelId, dmUserId, userId }) => {
            try {
                // Store userId on socket for later use
                if (userId) {
                    socket.userId = parseInt(userId);
                    socket.join(`user_${userId}`); // Join personal room for notifications
                }

                // Leave all previous rooms except socket.id
                const rooms = [...socket.rooms];
                rooms.forEach(r => {
                    if (r !== socket.id) {
                        socket.leave(r);
                    }
                });

                // Handle DM room join
                if (dmUserId && userId) {
                    const currentUserId = parseInt(userId);
                    const otherUserId = parseInt(dmUserId);
                    const minId = Math.min(currentUserId, otherUserId);
                    const maxId = Math.max(currentUserId, otherUserId);
                    const dmRoom = `dm_${minId}_${maxId}`;
                    socket.join(dmRoom);
                    console.log(`User ${socket.id} joined DM room: ${dmRoom}`);

                    // Load DM history
                    const dmHistory = await prisma.directMessage.findMany({
                        where: {
                            OR: [
                                { senderId: currentUserId, receiverId: otherUserId },
                                { senderId: otherUserId, receiverId: currentUserId }
                            ]
                        },
                        orderBy: { createdAt: 'asc' },
                        take: 50,
                        include: {
                            sender: { select: { id: true, username: true } }
                        }
                    });

                    socket.emit('load_history', dmHistory.map(msg => ({
                        id: msg.id.toString(),
                        userId: msg.senderId,
                        author: msg.sender?.username || 'Unknown',
                        message: msg.content,
                        type: msg.type || 'text',
                        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    })));
                    return;
                }

                // Handle channel room join
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
                        userId: msg.userId,
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
                const { message, author, channelId, receiverId, type, expiresIn, userId } = data;

                // Handle DM messages
                if (receiverId && !channelId) {
                    const currentUserId = userId || socket.userId;
                    const minId = Math.min(currentUserId, receiverId);
                    const maxId = Math.max(currentUserId, receiverId);
                    const dmRoom = `dm_${minId}_${maxId}`;

                    // Save DM to database
                    const savedDM = await prisma.directMessage.create({
                        data: {
                            content: message,
                            type: type || 'text',
                            senderId: parseInt(currentUserId),
                            receiverId: parseInt(receiverId)
                        },
                        include: {
                            sender: { select: { username: true } }
                        }
                    });

                    // Broadcast DM to both users
                    io.to(dmRoom).emit('receive_message', {
                        id: savedDM.id.toString(),
                        message: message,
                        author: savedDM.sender?.username || author,
                        userId: currentUserId,
                        type: type || 'text',
                        receiverId: receiverId,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    });

                    console.log(`DM saved and sent from ${currentUserId} to ${receiverId} in room ${dmRoom}`);
                    return;
                }

                // Handle channel messages
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
                    userId: savedMessage.userId,
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
