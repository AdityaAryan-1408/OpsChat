const { createServer } = require('http');
const { Server } = require('socket.io');
const { io: Client } = require('socket.io-client');

describe('Socket.io Integration', () => {
    let io, serverSocket, clientSocket, httpServer;

    beforeAll((done) => {
        httpServer = createServer();
        io = new Server(httpServer);

        httpServer.listen(() => {
            const port = httpServer.address().port;
            clientSocket = Client(`http://localhost:${port}`);

            io.on('connection', (socket) => {
                serverSocket = socket;
            });

            clientSocket.on('connect', done);
        });
    });

    afterAll(() => {
        io.close();
        clientSocket.close();
        httpServer.close();
    });

    describe('Connection', () => {
        it('should connect successfully', () => {
            expect(clientSocket.connected).toBe(true);
        });

        it('should have a socket id', () => {
            expect(clientSocket.id).toBeTruthy();
        });
    });

    describe('Events', () => {
        it('should receive messages from server', (done) => {
            const testMessage = { content: 'Hello World' };

            clientSocket.on('test_event', (data) => {
                expect(data).toEqual(testMessage);
                done();
            });

            serverSocket.emit('test_event', testMessage);
        });

        it('should send messages to server', (done) => {
            const testMessage = { content: 'Client message' };

            serverSocket.on('client_event', (data) => {
                expect(data).toEqual(testMessage);
                done();
            });

            clientSocket.emit('client_event', testMessage);
        });

        it('should handle join_channel event structure', (done) => {
            serverSocket.on('join_channel', (data) => {
                expect(data).toHaveProperty('channelName');
                expect(data).toHaveProperty('workspaceId');
                done();
            });

            clientSocket.emit('join_channel', {
                channelName: 'general',
                workspaceId: 1
            });
        });

        it('should handle send_message event structure', (done) => {
            serverSocket.on('send_message', (data) => {
                expect(data).toHaveProperty('message');
                expect(data).toHaveProperty('author');
                expect(data).toHaveProperty('channelName');
                done();
            });

            clientSocket.emit('send_message', {
                message: 'Test message',
                author: 'TestUser',
                channelName: 'general',
                type: 'text'
            });
        });
    });
});
