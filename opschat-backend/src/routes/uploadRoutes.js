const express = require('express');
const { s3PublicClient, PutObjectCommand, getSignedUrl, BUCKET_NAME } = require('../config/s3');

const router = express.Router();

// Get presigned URL for file upload
router.post('/upload-url', async (req, res) => {
    const { filename, fileType } = req.body;
    if (!filename || !fileType) return res.status(400).json({ error: "Missing file info" });

    const cleanFilename = filename.replace(/\s+/g, '-');
    const uniqueKey = `${Date.now()}-${cleanFilename}`;

    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: uniqueKey,
            ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(s3PublicClient, command, { expiresIn: 60 });
        const fileUrl = `${process.env.S3_PUBLIC_URL || 'http://localhost:9000'}/${BUCKET_NAME}/${uniqueKey}`;

        res.json({ uploadUrl, fileUrl });
    } catch (error) {
        console.error("Presigned URL Error:", error);
        res.status(500).json({ error: "Failed to generate upload URL" });
    }
});

module.exports = router;
