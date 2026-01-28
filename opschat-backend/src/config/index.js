const prisma = require('./database');
const { pubClient, subClient, connectRedis } = require('./redis');
const { s3Client, PutObjectCommand, getSignedUrl, initializeBucket, BUCKET_NAME } = require('./s3');
const groq = require('./groq');

module.exports = {
    prisma,
    pubClient,
    subClient,
    connectRedis,
    s3Client,
    PutObjectCommand,
    getSignedUrl,
    initializeBucket,
    BUCKET_NAME,
    groq
};
