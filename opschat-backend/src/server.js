const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"]
    }
});


app.use(cors);
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: "ok" });
});

io.on('connection', (socket) => {
    console.log(`User Connected : ${socket.id}`);

    socket.on('join_room', (data) => {
        socket.join(data);
        console.log(data);
    });

    socket.on('send_message', data => {
        socket.to(data.room).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
    })
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});