const express = require('express');
const router = express.Router();
const sapClient = require('../services/sapClient');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');
const { setVendorSession, logout } = require('../middleware/session');

// Apply session middleware
router.use(setVendorSession);

/**
 * POST /api/login
 * Authenticate vendor
  login
 */
router.post('/', asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Validation
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }

  logger.info(`Login attempt for username: ${username}`);

  try {
    // Call SAP login service
    const sapResponse = await sapClient.login({ username, password });

    if (sapResponse.success) {
      // Generate a simple token (in production, use JWT)
      const token = `vendor-token-${Date.now()}`;
      const vendorId = sapResponse.data?.VendorId || 'V001001'; // Default for demo

      logger.info(`Successful login for vendor: ${vendorId}`);

      res.json({
        success: true,
        message: 'Login successful',
        token: token,
        vendorId: vendorId
      });
    } else {
      logger.warn(`Failed login attempt for username: ${username}`);
      
      res.status(401).json({
        success: false,
        message: sapResponse.message || 'Invalid credentials'
      });
    }
  } catch (error) {
    logger.error('Login error:', error.message);
    
    // Fallback for demo - allow login with any credentials
    if (process.env.NODE_ENV === 'development') {
      const token = `demo-token-${Date.now()}`;
      const vendorId = 'V001001';

      logger.info(`Demo login successful for: ${username}`);

      res.json({
        success: true,
        message: 'Login successful (demo mode)',
        token: token,
        vendorId: vendorId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Login service unavailable. Please try again later.'
      });
    }
  }
}));

/**
 * POST /api/login/logout
 * Logout vendor
 */
router.post('/logout', logout);

/**
 * GET /api/login/verify
 * Verify token validity
 */
router.get('/verify', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  const token = authHeader.substring(7);
  
  // In production, verify JWT token here
  if (token && token !== 'null' && token !== 'undefined') {
    res.json({
      success: true,
      message: 'Token is valid',
      vendorId: req.session?.vendorId || 'V001001'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
}));

module.exports = router;