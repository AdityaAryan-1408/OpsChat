const { createClient } = require('redis');

const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

const connectRedis = async () => {
    await Promise.all([pubClient.connect(), subClient.connect()]);
    console.log("Redis Connected");
};

module.exports = { pubClient, subClient, connectRedis };
