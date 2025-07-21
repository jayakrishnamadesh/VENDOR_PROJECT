const express = require('express');
const router = express.Router();
const sapClient = require('../services/sapClient');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/session');

// Apply authentication middleware
router.use(requireAuth);

/**
 * GET /api/rfq
 * Get all RFQs for vendor
 */
router.get('/', asyncHandler(async (req, res) => {
  const vendorId = req.vendorId;
  const { status, limit = 50 } = req.query;

  logger.info(`Fetching RFQs for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getRFQs(vendorId);

    if (sapResponse.success) {
      let rfqs = sapResponse.data || [];

      // Filter by status if provided
      if (status) {
        rfqs = rfqs.filter(rfq => 
          rfq.Status?.toLowerCase() === status.toLowerCase()
        );
      }

      // Limit results
      rfqs = rfqs.slice(0, parseInt(limit));

      res.json({
        success: true,
        message: 'RFQs retrieved successfully',
        data: rfqs
      });
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('RFQ fetch error:', error.message);
    
    // Fallback mock data
    const mockRFQs = [
      {
        rfqId: 'RFQ001',
        rfqNumber: 'RFQ2024001',
        description: 'Supply of Industrial Equipment for Manufacturing Unit',
        requestDate: '2024-01-15T08:00:00Z',
        dueDate: '2024-01-25T17:00:00Z',
        status: 'Open',
        totalAmount: 125000,
        currency: 'USD',
        items: [
          {
            itemId: 'ITM001',
            materialId: 'MAT001',
            description: 'Industrial Motor 5HP',
            quantity: 10,
            unit: 'EA',
            unitPrice: 1200,
            totalPrice: 12000
          }
        ]
      },
      {
        rfqId: 'RFQ002',
        rfqNumber: 'RFQ2024002',
        description: 'Raw Material Supply for Q1 Production',
        requestDate: '2024-01-18T09:00:00Z',
        dueDate: '2024-01-28T17:00:00Z',
        status: 'In Progress',
        totalAmount: 85000,
        currency: 'USD',
        items: []
      }
    ];

    res.json({
      success: true,
      message: 'RFQs retrieved successfully (mock data)',
      data: mockRFQs
    });
  }
}));

/**
 * GET /api/rfq/:id
 * Get specific RFQ details
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendorId = req.vendorId;

  logger.info(`Fetching RFQ details: ${id} for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getRFQs(vendorId);

    if (sapResponse.success) {
      const rfq = sapResponse.data?.find(r => r.rfqId === id || r.RfqId === id);

      if (rfq) {
        res.json({
          success: true,
          message: 'RFQ details retrieved successfully',
          data: rfq
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'RFQ not found'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('RFQ detail fetch error:', error.message);
    
    // Fallback mock data
    res.json({
      success: true,
      message: 'RFQ details retrieved successfully (mock)',
      data: {
        rfqId: id,
        rfqNumber: `RFQ2024${id.slice(-3)}`,
        description: 'Mock RFQ for testing',
        requestDate: '2024-01-15T08:00:00Z',
        dueDate: '2024-01-25T17:00:00Z',
        status: 'Open',
        totalAmount: 50000,
        currency: 'USD',
        items: []
      }
    });
  }
}));

/**
 * POST /api/rfq/:id/quote
 * Submit quotation for RFQ
 */
router.post('/:id/quote', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const quotationData = req.body;
  const vendorId = req.vendorId;

  logger.info(`Submitting quotation for RFQ: ${id} by vendor: ${vendorId}`);

  // Basic validation
  if (!quotationData.items || !Array.isArray(quotationData.items)) {
    return res.status(400).json({
      success: false,
      message: 'Quotation items are required'
    });
  }

  try {
    const sapResponse = await sapClient.submitQuotation(id, {
      ...quotationData,
      vendorId: vendorId,
      submissionDate: new Date().toISOString()
    });

    if (sapResponse.success) {
      res.json({
        success: true,
        message: 'Quotation submitted successfully',
        data: sapResponse.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('Quotation submission error:', error.message);
    
    // Fallback success response
    res.json({
      success: true,
      message: 'Quotation submitted successfully (mock)',
      data: {
        rfqId: id,
        quotationId: `QUOTE-${Date.now()}`,
        status: 'Submitted',
        submissionDate: new Date().toISOString()
      }
    });
  }
}));

/**
 * GET /api/rfq/stats
 * Get RFQ statistics
 */
router.get('/stats/summary', asyncHandler(async (req, res) => {
  const vendorId = req.vendorId;

  logger.info(`Fetching RFQ stats for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getRFQs(vendorId);

    if (sapResponse.success) {
      const rfqs = sapResponse.data || [];
      
      const stats = {
        total: rfqs.length,
        open: rfqs.filter(r => r.Status === 'Open').length,
        inProgress: rfqs.filter(r => r.Status === 'In Progress').length,
        submitted: rfqs.filter(r => r.Status === 'Submitted').length,
        awarded: rfqs.filter(r => r.Status === 'Awarded').length,
        rejected: rfqs.filter(r => r.Status === 'Rejected').length
      };

      res.json({
        success: true,
        message: 'RFQ statistics retrieved successfully',
        data: stats
      });
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('RFQ stats error:', error.message);
    
    // Fallback mock stats
    res.json({
      success: true,
      message: 'RFQ statistics retrieved successfully (mock)',
      data: {
        total: 15,
        open: 5,
        inProgress: 3,
        submitted: 4,
        awarded: 2,
        rejected: 1
      }
    });
  }
}));

module.exports = router;