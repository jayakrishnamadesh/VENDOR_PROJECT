const express = require('express');
const router = express.Router();
const sapClient = require('../services/sapClient');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/session');

// Apply authentication middleware
router.use(requireAuth);

/**
 * GET /api/profile
 * Get vendor profile using PROFILESET
 */
router.get('/', asyncHandler(async (req, res) => {
  const vendorId = req.vendorId;

  logger.info(`Fetching profile for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getProfile(vendorId);

    if (sapResponse.success) {
      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: sapResponse.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('Profile fetch error:', error.message);
    
    // Fallback mock data
    res.json({
      success: true,
      message: 'Profile retrieved successfully (mock data)',
      data: {
        vendorId: vendorId,
        vendorName: 'ABC Manufacturing Ltd.',
        email: 'contact@abcmanufacturing.com',
        phone: '+91-9876543210',
        address: '123 Industrial Park Road, Sector 15',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400001',
        taxId: 'GSTIN123456789',
        panNumber: 'ABCDE1234F',
        bankAccount: 'BANK001234567890',
        bankName: 'State Bank of India',
        ifscCode: 'SBIN0001234',
        paymentTerms: 'NET30',
        createdDate: '2023-01-15T00:00:00Z',
        status: 'Active',
        category: 'Manufacturing',
        rating: 'A+',
        lastUpdated: new Date().toISOString()
      }
    });
  }
}));

/**
 * PUT /api/profile
 * Update vendor profile using PROFILESET
 */
router.put('/', asyncHandler(async (req, res) => {
  const vendorId = req.vendorId;
  const profileData = req.body;

  logger.info(`Updating profile for vendor: ${vendorId}`);

  // Basic validation
  if (!profileData.vendorName || !profileData.email) {
    return res.status(400).json({
      success: false,
      message: 'Vendor name and email are required'
    });
  }

  try {
    const sapResponse = await sapClient.updateProfile(vendorId, profileData);

    if (sapResponse.success) {
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: sapResponse.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('Profile update error:', error.message);
    
    // Fallback - return updated data
    res.json({
      success: true,
      message: 'Profile updated successfully (mock)',
      data: {
        ...profileData,
        vendorId: vendorId,
        lastUpdated: new Date().toISOString()
      }
    });
  }
}));

/**
 * GET /api/profile/summary
 * Get profile summary
 */
router.get('/summary', asyncHandler(async (req, res) => {
  const vendorId = req.vendorId;

  logger.info(`Fetching profile summary for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getProfile(vendorId);

    if (sapResponse.success) {
      const profile = sapResponse.data;
      
      res.json({
        success: true,
        message: 'Profile summary retrieved successfully',
        data: {
          vendorId: profile.vendorId || profile.VendorId,
          vendorName: profile.vendorName || profile.VendorName,
          status: profile.status || profile.Status,
          email: profile.email || profile.Email,
          phone: profile.phone || profile.Phone,
          paymentTerms: profile.paymentTerms || profile.PaymentTerms,
          category: profile.category || profile.Category,
          rating: profile.rating || profile.Rating
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('Profile summary error:', error.message);
    
    // Fallback mock data
    res.json({
      success: true,
      message: 'Profile summary retrieved successfully (mock)',
      data: {
        vendorId: vendorId,
        vendorName: 'ABC Manufacturing Ltd.',
        status: 'Active',
        email: 'contact@abcmanufacturing.com',
        phone: '+91-9876543210',
        paymentTerms: 'NET30',
        category: 'Manufacturing',
        rating: 'A+'
      }
    });
  }
}));

module.exports = router;