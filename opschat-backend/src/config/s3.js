const { S3Client, CreateBucketCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Internal S3 client - for server-side operations (bucket creation, etc.)
const s3Client = new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT || "http://127.0.0.1:9000",
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "admin",
        secretAccessKey: process.env.S3_SECRET_KEY || "password123"
    }
});

// Public S3 client - for generating presigned URLs that the browser can access
// Uses S3_PUBLIC_URL which should be the externally accessible MinIO address
const s3PublicClient = new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT || "http://127.0.0.1:9000",
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "admin",
        secretAccessKey: process.env.S3_SECRET_KEY || "password123"
    }
});

const BUCKET_NAME = process.env.S3_BUCKET || "opschat-uploads";

const initializeBucket = async () => {
    try {
        await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
        console.log(`MinIO Bucket '${BUCKET_NAME}' created`);
    } catch (err) {
        if (err.name === 'BucketAlreadyOwnedByYou' || err.name === 'BucketAlreadyExists') {
            console.log(`MinIO Bucket '${BUCKET_NAME}' already exists`);
        } else {
            console.error("MinIO Bucket creation error:", err.message);
        }
    }
};

module.exports = { s3Client, s3PublicClient, PutObjectCommand, getSignedUrl, initializeBucket, BUCKET_NAME };
