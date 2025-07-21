const express = require('express');
const router = express.Router();
const sapClient = require('../services/sapClient');
const logger = require('../utils/logger');

// Mock data for fallback
const mockLoginResponse = {
  success: true,
  user: {
    vendorId: 'V001',
    vendorName: 'Demo Vendor',
    email: 'demo@vendor.com',
    status: 'Active'
  }
};

// Login endpoint
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Username and password are required' }
      });
    }

    try {
      // Attempt SAP authentication
      const sapResponse = await sapClient.get('/VENDORLOGINSET', {
        $filter: `Username eq '${username}' and Password eq '${password}'`
      });

      if (sapResponse.d && sapResponse.d.results && sapResponse.d.results.length > 0) {
        const user = sapResponse.d.results[0];
        
        // Store user in session
        req.session.user = {
          vendorId: user.VendorId,
          vendorName: user.VendorName,
          email: user.Email,
          status: user.Status
        };

        logger.info(`User ${username} logged in successfully`);
        
        res.json({
          success: true,
          user: req.session.user
        });
      } else {
        res.status(401).json({
          success: false,
          error: { message: 'Invalid credentials' }
        });
      }
    } catch (sapError) {
      logger.warn('SAP login failed, using mock data:', sapError.message);
      
      // Fallback to mock authentication
      if (username === 'demo' && password === 'demo') {
        req.session.user = mockLoginResponse.user;
        res.json(mockLoginResponse);
      } else {
        res.status(401).json({
          success: false,
          error: { message: 'Invalid credentials' }
        });
      }
    }
  } catch (error) {
    next(error);
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logger.error('Session destruction error:', err);
      return res.status(500).json({
        success: false,
        error: { message: 'Logout failed' }
      });
    }
    
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      success: true,
      authenticated: true,
      user: req.session.user
    });
  } else {
    res.json({
      success: true,
      authenticated: false
    });
  }
});

module.exports = router;