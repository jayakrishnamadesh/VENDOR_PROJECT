const logger = require('../utils/logger');

const sessionMiddleware = (req, res, next) => {
  // Skip authentication for login and health check endpoints
  const publicPaths = ['/api/auth/login', '/api/health'];
  
  if (publicPaths.includes(req.path)) {
    return next();
  }

  // Check if user is authenticated
  if (!req.session || !req.session.user) {
    logger.warn(`Unauthorized access attempt to ${req.path} from ${req.ip}`);
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication required'
      }
    });
  }

  // Add user info to request
  req.user = req.session.user;
  next();
};

module.exports = sessionMiddleware;