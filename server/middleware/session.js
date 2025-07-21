const logger = require('../utils/logger');

/**
 * Session management middleware
 * Handles basic session-based authentication
 */

const requireAuth = (req, res, next) => {
  // Skip authentication for login endpoint
  if (req.path.includes('/login')) {
    return next();
  }

  // Check for Authorization header or session
  const authHeader = req.headers.authorization;
  const sessionVendor = req.session?.vendorId;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Extract token from Authorization header
    const token = authHeader.substring(7);
    
    // In a real implementation, you would verify the JWT token here
    // For demo purposes, we'll just check if token exists
    if (token && token !== 'null' && token !== 'undefined') {
      req.vendorId = req.session?.vendorId || 'V001001'; // Default for demo
      return next();
    }
  }

  if (sessionVendor) {
    req.vendorId = sessionVendor;
    return next();
  }

  logger.warn(`Unauthorized access attempt: ${req.method} ${req.path} - ${req.ip}`);
  
  return res.status(401).json({
    success: false,
    message: 'Authentication required. Please login first.',
    error: 'UNAUTHORIZED'
  });
};

const setVendorSession = (req, res, next) => {
  // Set vendor session after successful login
  if (req.method === 'POST' && req.path.includes('/login')) {
    const originalSend = res.send;
    
    res.send = function(data) {
      try {
        const responseData = typeof data === 'string' ? JSON.parse(data) : data;
        
        if (responseData.success && responseData.vendorId) {
          req.session.vendorId = responseData.vendorId;
          req.session.loginTime = new Date().toISOString();
          
          logger.info(`Session created for vendor: ${responseData.vendorId}`);
        }
      } catch (error) {
        logger.error('Error parsing login response:', error.message);
      }
      
      originalSend.call(this, data);
    };
  }
  
  next();
};

const logout = (req, res) => {
  const vendorId = req.session?.vendorId;
  
  req.session.destroy((err) => {
    if (err) {
      logger.error('Session destruction error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to logout'
      });
    }
    
    logger.info(`Vendor logged out: ${vendorId}`);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
};

module.exports = {
  requireAuth,
  setVendorSession,
  logout
};