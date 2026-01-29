const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { sendRequest, getPendingRequests, respondToRequest } = require('../controllers/friendController');

const router = express.Router();

// All friend routes require authentication
router.use(authMiddleware);

// Send a friend request
router.post('/send', sendRequest);

// Get pending friend requests (received)
router.get('/pending', getPendingRequests);

// Accept or reject a friend request
router.post('/respond', respondToRequest);

module.exports = router;
