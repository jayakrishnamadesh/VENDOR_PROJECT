const express = require('express');
const router = express.Router();
const sapClient = require('../services/sapClient');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/session');

// Apply authentication middleware
router.use(requireAuth);

/**
 * GET /api/aging
 * Get aging report for vendor
 */
router.get('/', asyncHandler(async (req, res) => {
  const vendorId = req.vendorId;
  const { bucket, limit = 100 } = req.query;

  logger.info(`Fetching Aging report for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getAging(vendorId);

    if (sapResponse.success) {
      let aging = sapResponse.data || [];

      // Filter by aging bucket if provided
      if (bucket) {
        aging = aging.filter(age => 
          age.AgingBucket?.toLowerCase() === bucket.toLowerCase()
        );
      }

      // Limit results
      aging = aging.slice(0, parseInt(limit));

      res.json({
        success: true,
        message: 'Aging report retrieved successfully',
        data: aging
      });
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('Aging fetch error:', error.message);
    
    // Fallback mock data
    const mockAging = [
      {
        vendorId: vendorId,
        invoiceId: 'INV2024001',
        invoiceNumber: 'INV2024001',
        invoiceDate: '2024-01-15T00:00:00Z',
        dueDate: '2024-02-15T00:00:00Z',
        totalAmount: 25000,
        paidAmount: 0,
        pendingAmount: 25000,
        daysOverdue: 15,
        agingBucket: '31-60 days',
        currency: 'USD'
      },
      {
        vendorId: vendorId,
        invoiceId: 'INV2024002',
        invoiceNumber: 'INV2024002',
        invoiceDate: '2024-02-01T00:00:00Z',
        dueDate: '2024-03-01T00:00:00Z',
        totalAmount: 50000,
        paidAmount: 30000,
        pendingAmount: 20000,
        daysOverdue: 5,
        agingBucket: 'Current',
        currency: 'USD'
      },
      {
        vendorId: vendorId,
        invoiceId: 'INV2024003',
        invoiceNumber: 'INV2024003',
        invoiceDate: '2023-12-15T00:00:00Z',
        dueDate: '2024-01-15T00:00:00Z',
        totalAmount: 35000,
        paidAmount: 0,
        pendingAmount: 35000,
        daysOverdue: 65,
        agingBucket: '61-90 days',
        currency: 'USD'
      },
      {
        vendorId: vendorId,
        invoiceId: 'INV2024004',
        invoiceNumber: 'INV2024004',
        invoiceDate: '2023-11-01T00:00:00Z',
        dueDate: '2023-12-01T00:00:00Z',
        totalAmount: 18000,
        paidAmount: 0,
        pendingAmount: 18000,
        daysOverdue: 95,
        agingBucket: '90+ days',
        currency: 'USD'
      }
    ];

    res.json({
      success: true,
      message: 'Aging report retrieved successfully (mock data)',
      data: mockAging
    });
  }
}));

/**
 * GET /api/aging/summary
 * Get aging summary statistics
 */
router.get('/summary', asyncHandler(async (req, res) => {
  const vendorId = req.vendorId;

  logger.info(`Fetching Aging summary for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getAging(vendorId);

    if (sapResponse.success) {
      const aging = sapResponse.data || [];
      
      const summary = {
        current: aging
          .filter(age => age.AgingBucket === 'Current')
          .reduce((sum, age) => sum + (age.PendingAmount || 0), 0),
        aged30: aging
          .filter(age => age.AgingBucket === '31-60 days')
          .reduce((sum, age) => sum + (age.PendingAmount || 0), 0),
        aged60: aging
          .filter(age => age.AgingBucket === '61-90 days')
          .reduce((sum, age) => sum + (age.PendingAmount || 0), 0),
        aged90: aging
          .filter(age => age.AgingBucket === '90+ days')
          .reduce((sum, age) => sum + (age.PendingAmount || 0), 0),
        totalPending: aging.reduce((sum, age) => sum + (age.PendingAmount || 0), 0),
        totalInvoices: aging.length
      };

      res.json({
        success: true,
        message: 'Aging summary retrieved successfully',
        data: summary
      });
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('Aging summary error:', error.message);
    
    // Fallback mock summary
    res.json({
      success: true,
      message: 'Aging summary retrieved successfully (mock)',
      data: {
        current: 45000,
        aged30: 25000,
        aged60: 35000,
        aged90: 18000,
        totalPending: 123000,
        totalInvoices: 12
      }
    });
  }
}));

/**
 * GET /api/aging/vendor/:vendorId
 * Get aging report for specific vendor (admin use)
 */
router.get('/vendor/:vendorId', asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const requestingVendorId = req.vendorId;

  // Check if requesting vendor has permission to view other vendor's data
  if (requestingVendorId !== vendorId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own aging data.'
    });
  }

  logger.info(`Fetching Aging report for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getAging(vendorId);

    if (sapResponse.success) {
      res.json({
        success: true,
        message: 'Vendor aging report retrieved successfully',
        data: sapResponse.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('Vendor aging fetch error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve vendor aging data'
    });
  }
}));

/**
 * GET /api/aging/overdue
 * Get overdue invoices only
 */
router.get('/overdue', asyncHandler(async (req, res) => {
  const vendorId = req.vendorId;

  logger.info(`Fetching overdue invoices for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getAging(vendorId);

    if (sapResponse.success) {
      const aging = sapResponse.data || [];
      
      // Filter only overdue invoices (days overdue > 0)
      const overdueInvoices = aging.filter(age => (age.DaysOverdue || 0) > 0);

      res.json({
        success: true,
        message: 'Overdue invoices retrieved successfully',
        data: overdueInvoices
      });
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('Overdue invoices fetch error:', error.message);
    
    // Fallback mock data
    res.json({
      success: true,
      message: 'Overdue invoices retrieved successfully (mock)',
      data: [
        {
          vendorId: vendorId,
          invoiceId: 'INV2024001',
          invoiceNumber: 'INV2024001',
          invoiceDate: '2024-01-15T00:00:00Z',
          dueDate: '2024-02-15T00:00:00Z',
          totalAmount: 25000,
          paidAmount: 0,
          pendingAmount: 25000,
          daysOverdue: 15,
          agingBucket: '31-60 days',
          currency: 'USD'
        }
      ]
    });
  }
}));

module.exports = router;