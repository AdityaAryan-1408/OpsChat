const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get current user's profile
// GET /api/users/profile
router.get('/profile', authenticateToken, userController.getProfile);

// Update current user's profile
// PUT /api/users/profile
router.put('/profile', authenticateToken, userController.updateProfile);

// Get any user's public profile by ID
// GET /api/users/:userId
router.get('/:userId', authenticateToken, userController.getUserById);

module.exports = router;