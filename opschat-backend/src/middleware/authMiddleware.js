// Simple auth middleware - extracts user from request
// In production, you'd verify JWT tokens here

const authMiddleware = (req, res, next) => {
    // Get userId from header (sent by frontend after login)
    const userId = req.headers['x-user-id'];

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    req.user = {
        userId: parseInt(userId)
    };

    next();
};

// Export both ways for compatibility
module.exports = authMiddleware;
module.exports.authenticateToken = authMiddleware;
