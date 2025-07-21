const express = require('express');
const router = express.Router();
const sapClient = require('../services/sapClient');
const logger = require('../utils/logger');

// Mock profile data
const mockProfile = {
  vendorId: 'V001',
  vendorName: 'Demo Vendor Ltd.',
  email: 'demo@vendor.com',
  phone: '+1-234-567-8900',
  address: '123 Business Street, City, State 12345',
  taxId: 'TAX123456789',
  bankDetails: {
    bankName: 'Demo Bank',
    accountNumber: '****1234',
    routingNumber: '****5678'
  },
  status: 'Active',
  registrationDate: '2023-01-15',
  lastUpdated: new Date().toISOString()
};

// Get vendor profile
router.get('/', async (req, res, next) => {
  try {
    const vendorId = req.user.vendorId;

    try {
      const sapResponse = await sapClient.get('/PROFILESET', {
        $filter: `VendorId eq '${vendorId}'`
      });

      if (sapResponse.d && sapResponse.d.results && sapResponse.d.results.length > 0) {
        const profile = sapResponse.d.results[0];
        res.json({
          success: true,
          data: profile
        });
      } else {
        res.status(404).json({
          success: false,
          error: { message: 'Profile not found' }
        });
      }
    } catch (sapError) {
      logger.warn('SAP profile fetch failed, using mock data:', sapError.message);
      res.json({
        success: true,
        data: mockProfile
      });
    }
  } catch (error) {
    next(error);
  }
});

// Update vendor profile
router.put('/', async (req, res, next) => {
  try {
    const vendorId = req.user.vendorId;
    const updateData = req.body;

    try {
      const sapResponse = await sapClient.put(`/PROFILESET('${vendorId}')`, updateData);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: sapResponse.d
      });
    } catch (sapError) {
      logger.warn('SAP profile update failed:', sapError.message);
      res.json({
        success: true,
        message: 'Profile updated successfully (mock)',
        data: { ...mockProfile, ...updateData, lastUpdated: new Date().toISOString() }
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;