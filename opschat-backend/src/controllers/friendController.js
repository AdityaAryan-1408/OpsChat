const prisma = require('../config/database');


const sendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user.userId;

        if (senderId === parseInt(receiverId)) {
            return res.status(400).json({ error: "You cannot send a request to yourself" });
        }


        const existingRequest = await prisma.friendRequest.findFirst({
            where: {
                OR: [
                    { senderId, receiverId: parseInt(receiverId) },
                    { senderId: parseInt(receiverId), receiverId: senderId }
                ]
            }
        });

        if (existingRequest) {
            return res.status(400).json({ error: "Request already exists or you are already friends" });
        }

        const request = await prisma.friendRequest.create({
            data: {
                senderId,
                receiverId: parseInt(receiverId),
                status: 'PENDING'
            },
            include: {
                sender: {
                    select: { id: true, username: true, avatar: true }
                }
            }
        });

        // TODO: Emit Socket Event here later for Real-time notification

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
            where: { id: parseInt(requestId) }
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

        // TODO: Emit Socket Event here for "Request Accepted"

        res.json(updatedRequest);
    } catch (error) {
        console.error("Respond Request Error:", error);
        res.status(500).json({ error: "Failed to respond to request" });
    }
};

module.exports = {
    sendRequest,
    getPendingRequests,
    respondToRequest
};