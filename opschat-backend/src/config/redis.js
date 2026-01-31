const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 
    `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();

pubClient.on('error', (err) => console.error('Redis Pub Client Error', err));
subClient.on('error', (err) => console.error('Redis Sub Client Error', err));

const connectRedis = async () => {
    try {
        await Promise.all([pubClient.connect(), subClient.connect()]);
        console.log(`✅ Redis Connected to ${redisUrl}`);
    } catch (err) {
        console.error('❌ Failed to connect to Redis:', err);
        process.exit(1); 
    }
};

module.exports = { pubClient, subClient, connectRedis };