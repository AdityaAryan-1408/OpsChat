const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/create', authenticateToken, channelController.createChannel);

router.post('/join', authenticateToken, channelController.joinChannel);

router.get('/:workspaceId', authenticateToken, channelController.getChannels);

router.put('/:channelId', authenticateToken, channelController.updateChannel);

router.delete('/:channelId', authenticateToken, channelController.deleteChannel);

module.exports = router;