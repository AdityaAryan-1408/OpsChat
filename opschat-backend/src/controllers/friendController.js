const prisma = require('../config/database');


const sendRequest = async (req, res) => {
    try {
        const { receiverUsername } = req.body;
        const senderId = req.user.userId;

        // Find user by username
        const receiver = await prisma.user.findUnique({
            where: { username: receiverUsername }
        });

        if (!receiver) {
            return res.status(404).json({ error: "User not found" });
        }

        const receiverId = receiver.id;

        if (senderId === receiverId) {
            return res.status(400).json({ error: "You cannot send a request to yourself" });
        }

        const existingRequest = await prisma.friendRequest.findFirst({
            where: {
                OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }
        });

        if (existingRequest) {
            return res.status(400).json({ error: "Request already exists or you are already friends" });
        }

        const request = await prisma.friendRequest.create({
            data: {
                senderId,
                receiverId,
                status: 'PENDING'
            },
            include: {
                sender: {
                    select: { id: true, username: true, avatar: true }
                },
                receiver: {
                    select: { id: true, username: true, avatar: true }
                }
            }
        });

        // Emit Socket Event for Real-time notification
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${receiverId}`).emit('new_friend_request', request);
        }

        res.status(201).json(request);
    } catch (error) {
        console.error("Send Request Error:", error);
        res.status(500).json({ error: "Failed to send request" });
    }
};


const getPendingRequests = async (req, res) => {
    try {
        const userId = req.user.userId;

        const requests = await prisma.friendRequest.findMany({
            where: {
                receiverId: userId,
                status: 'PENDING'
            },
            include: {
                sender: {
                    select: { id: true, username: true, avatar: true }
                }
            }
        });

        res.json(requests);
    } catch (error) {
        console.error("Get Requests Error:", error);
        res.status(500).json({ error: "Failed to fetch requests" });
    }
};


const respondToRequest = async (req, res) => {
    try {
        const { requestId, status } = req.body;
        const userId = req.user.userId;

        const request = await prisma.friendRequest.findUnique({
            where: { id: parseInt(requestId) },
            include: {
                sender: { select: { id: true, username: true, avatar: true } },
                receiver: { select: { id: true, username: true, avatar: true } }
            }
        });

        if (!request || request.receiverId !== userId) {
            return res.status(404).json({ error: "Request not found or unauthorized" });
        }

        if (status === 'REJECTED') {
            await prisma.friendRequest.delete({
                where: { id: parseInt(requestId) }
            });
            return res.json({ message: "Request rejected" });
        }

        const updatedRequest = await prisma.friendRequest.update({
            where: { id: parseInt(requestId) },
            data: { status: 'ACCEPTED' }
        });

        // Emit Socket Event for "Request Accepted"
        const io = req.app.get('io');
        if (io) {
            // Notify the sender that receiver accepted
            io.to(`user_${request.senderId}`).emit('friend_request_accepted', {
                friend: request.receiver,
                requestId: request.id
            });

            // Also notify the receiver (current user) to update their list instantly
            io.to(`user_${userId}`).emit('friend_request_accepted', {
                friend: request.sender,
                requestId: request.id
            });
        }

        res.json(updatedRequest);
    } catch (error) {
        console.error("Respond Request Error:", error);
        res.status(500).json({ error: "Failed to respond to request" });
    }
};

// Get all accepted friends
const getFriends = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Find all accepted friend requests where user is sender OR receiver
        const friendRequests = await prisma.friendRequest.findMany({
            where: {
                status: 'ACCEPTED',
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            include: {
                sender: {
                    select: { id: true, username: true, name: true, status: true, avatar: true }
                },
                receiver: {
                    select: { id: true, username: true, name: true, status: true, avatar: true }
                }
            }
        });

        // Extract the friend (the other person in the relationship)
        const friends = friendRequests.map(req => {
            if (req.senderId === userId) {
                return req.receiver;
            } else {
                return req.sender;
            }
        });

        res.json(friends);
    } catch (error) {
        console.error("Get Friends Error:", error);
        res.status(500).json({ error: "Failed to fetch friends" });
    }
};

module.exports = {
    sendRequest,
    getPendingRequests,
    respondToRequest,
    getFriends
};