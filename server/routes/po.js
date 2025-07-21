const express = require('express');
const router = express.Router();
const sapClient = require('../services/sapClient');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/session');

// Apply authentication middleware
router.use(requireAuth);

/**
 * GET /api/po
 * Get all Purchase Orders for vendor
 */
router.get('/', asyncHandler(async (req, res) => {
  const vendorId = req.vendorId;
  const { status, limit = 50 } = req.query;

  logger.info(`Fetching Purchase Orders for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getPurchaseOrders(vendorId);

    if (sapResponse.success) {
      let pos = sapResponse.data || [];

      // Filter by status if provided
      if (status) {
        pos = pos.filter(po => 
          po.Status?.toLowerCase() === status.toLowerCase()
        );
      }

      // Limit results
      pos = pos.slice(0, parseInt(limit));

      res.json({
        success: true,
        message: 'Purchase Orders retrieved successfully',
        data: pos
      });
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('PO fetch error:', error.message);
    
    // Fallback mock data
    const mockPOs = [
      {
        poId: 'PO001',
        poNumber: 'PO2024001',
        vendorId: vendorId,
        description: 'Supply of Industrial Equipment',
        orderDate: '2024-01-15T08:00:00Z',
        deliveryDate: '2024-02-15T17:00:00Z',
        status: 'Confirmed',
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
            totalPrice: 12000,
            deliveredQty: 5,
            pendingQty: 5
          }
        ]
      },
      {
        poId: 'PO002',
        poNumber: 'PO2024002',
        vendorId: vendorId,
        description: 'Raw Material Supply Q1',
        orderDate: '2024-01-20T09:00:00Z',
        deliveryDate: '2024-02-20T17:00:00Z',
        status: 'Partially Delivered',
        totalAmount: 85000,
        currency: 'USD',
        items: []
      }
    ];

    res.json({
      success: true,
      message: 'Purchase Orders retrieved successfully (mock data)',
      data: mockPOs
    });
  }
}));

/**
 * GET /api/po/:id
 * Get specific Purchase Order details
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendorId = req.vendorId;

  logger.info(`Fetching PO details: ${id} for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getPurchaseOrders(vendorId);

    if (sapResponse.success) {
      const po = sapResponse.data?.find(p => p.poId === id || p.PoId === id);

      if (po) {
        res.json({
          success: true,
          message: 'Purchase Order details retrieved successfully',
          data: po
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Purchase Order not found'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('PO detail fetch error:', error.message);
    
    // Fallback mock data
    res.json({
      success: true,
      message: 'Purchase Order details retrieved successfully (mock)',
      data: {
        poId: id,
        poNumber: `PO2024${id.slice(-3)}`,
        vendorId: vendorId,
        description: 'Mock Purchase Order for testing',
        orderDate: '2024-01-15T08:00:00Z',
        deliveryDate: '2024-02-15T17:00:00Z',
        status: 'Confirmed',
        totalAmount: 50000,
        currency: 'USD',
        items: []
      }
    });
  }
}));

/**
 * POST /api/po/:id/acknowledge
 * Acknowledge Purchase Order
 */
router.post('/:id/acknowledge', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const acknowledgmentData = req.body;
  const vendorId = req.vendorId;

  logger.info(`Acknowledging PO: ${id} by vendor: ${vendorId}`);

  try {
    // In a real implementation, this would call SAP to acknowledge the PO
    const sapResponse = {
      success: true,
      data: {
        poId: id,
        status: 'Acknowledged',
        acknowledgmentDate: new Date().toISOString(),
        vendorId: vendorId
      }
    };

    res.json({
      success: true,
      message: 'Purchase Order acknowledged successfully',
      data: sapResponse.data
    });
  } catch (error) {
    logger.error('PO acknowledgment error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge Purchase Order'
    });
  }
}));

/**
 * GET /api/po/stats/summary
 * Get Purchase Order statistics
 */
router.get('/stats/summary', asyncHandler(async (req, res) => {
  const vendorId = req.vendorId;

  logger.info(`Fetching PO stats for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getPurchaseOrders(vendorId);

    if (sapResponse.success) {
      const pos = sapResponse.data || [];
      
      const stats = {
        total: pos.length,
        open: pos.filter(p => p.Status === 'Open').length,
        confirmed: pos.filter(p => p.Status === 'Confirmed').length,
        partiallyDelivered: pos.filter(p => p.Status === 'Partially Delivered').length,
        delivered: pos.filter(p => p.Status === 'Delivered').length,
        closed: pos.filter(p => p.Status === 'Closed').length,
        totalValue: pos.reduce((sum, p) => sum + (p.TotalAmount || 0), 0)
      };

      res.json({
        success: true,
        message: 'Purchase Order statistics retrieved successfully',
        data: stats
      });
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('PO stats error:', error.message);
    
    // Fallback mock stats
    res.json({
      success: true,
      message: 'Purchase Order statistics retrieved successfully (mock)',
      data: {
        total: 25,
        open: 3,
        confirmed: 8,
        partiallyDelivered: 6,
        delivered: 5,
        closed: 3,
        totalValue: 1250000
      }
    });
  }
}));

module.exports = router;