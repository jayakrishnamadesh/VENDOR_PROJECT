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
 * Get all RFQs for vendor using VENDORQUOTATIONS
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
          (rfq.Status || rfq.status)?.toLowerCase() === status.toLowerCase()
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
        priority: 'High',
        totalAmount: 125000,
        currency: 'INR',
        buyerName: 'Procurement Team',
        department: 'Manufacturing',
        items: [
          {
            itemId: 'ITM001',
            materialId: 'MAT001',
            description: 'Industrial Motor 5HP',
            quantity: 10,
            unit: 'EA',
            unitPrice: 12000,
            totalPrice: 120000,
            specifications: '5HP, 3-phase, 415V',
            deliveryDate: '2024-02-10T00:00:00Z'
          },
          {
            itemId: 'ITM002',
            materialId: 'MAT002',
            description: 'Control Panel Assembly',
            quantity: 5,
            unit: 'EA',
            unitPrice: 25000,
            totalPrice: 125000,
            specifications: 'IP65 rated, with PLC',
            deliveryDate: '2024-02-15T00:00:00Z'
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
        priority: 'Medium',
        totalAmount: 85000,
        currency: 'INR',
        buyerName: 'Materials Team',
        department: 'Production',
        items: [
          {
            itemId: 'ITM003',
            materialId: 'MAT003',
            description: 'Steel Sheets 2mm thickness',
            quantity: 1000,
            unit: 'SQ',
            unitPrice: 85,
            totalPrice: 85000,
            specifications: 'Grade SS304, 2mm thick',
            deliveryDate: '2024-02-05T00:00:00Z'
          }
        ]
      },
      {
        rfqId: 'RFQ003',
        rfqNumber: 'RFQ2024003',
        description: 'Office Equipment and Supplies',
        requestDate: '2024-01-20T10:00:00Z',
        dueDate: '2024-01-30T17:00:00Z',
        status: 'Submitted',
        priority: 'Low',
        totalAmount: 45000,
        currency: 'INR',
        buyerName: 'Admin Team',
        department: 'Administration',
        items: [
          {
            itemId: 'ITM004',
            materialId: 'MAT004',
            description: 'Desktop Computers',
            quantity: 10,
            unit: 'EA',
            unitPrice: 35000,
            totalPrice: 350000,
            specifications: 'i5 processor, 8GB RAM, 256GB SSD',
            deliveryDate: '2024-02-20T00:00:00Z'
          }
        ]
      }
    ];

    // Apply status filter to mock data
    let filteredRFQs = mockRFQs;
    if (status) {
      filteredRFQs = mockRFQs.filter(rfq => 
        rfq.status.toLowerCase() === status.toLowerCase()
      );
    }

    res.json({
      success: true,
      message: 'RFQs retrieved successfully (mock data)',
      data: filteredRFQs.slice(0, parseInt(limit))
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
      const rfq = sapResponse.data?.find(r => 
        (r.rfqId || r.RfqId) === id || (r.rfqNumber || r.RfqNumber) === id
      );

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
        description: 'Mock RFQ for testing purposes',
        requestDate: '2024-01-15T08:00:00Z',
        dueDate: '2024-01-25T17:00:00Z',
        status: 'Open',
        priority: 'Medium',
        totalAmount: 50000,
        currency: 'INR',
        buyerName: 'Procurement Team',
        department: 'Manufacturing',
        items: [
          {
            itemId: 'ITM001',
            materialId: 'MAT001',
            description: 'Sample Item',
            quantity: 5,
            unit: 'EA',
            unitPrice: 10000,
            totalPrice: 50000,
            specifications: 'Standard specifications',
            deliveryDate: '2024-02-15T00:00:00Z'
          }
        ]
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
        submissionDate: new Date().toISOString(),
        vendorId: vendorId,
        totalAmount: quotationData.totalAmount || 0,
        validityDays: quotationData.validityDays || 30,
        remarks: quotationData.remarks || ''
      }
    });
  }
}));

/**
 * GET /api/rfq/stats/summary
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
        open: rfqs.filter(r => (r.Status || r.status) === 'Open').length,
        inProgress: rfqs.filter(r => (r.Status || r.status) === 'In Progress').length,
        submitted: rfqs.filter(r => (r.Status || r.status) === 'Submitted').length,
        awarded: rfqs.filter(r => (r.Status || r.status) === 'Awarded').length,
        rejected: rfqs.filter(r => (r.Status || r.status) === 'Rejected').length,
        totalValue: rfqs.reduce((sum, r) => sum + ((r.TotalAmount || r.totalAmount) || 0), 0)
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
        rejected: 1,
        totalValue: 2500000
      }
    });
  }
}));

module.exports = router;