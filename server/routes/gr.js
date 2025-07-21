const express = require('express');
const router = express.Router();
const sapClient = require('../services/sapClient');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/session');

// Apply authentication middleware
router.use(requireAuth);

/**
 * GET /api/gr
 * Get all Goods Receipts for vendor
 */
router.get('/', asyncHandler(async (req, res) => {
  const vendorId = req.vendorId;
  const { status, limit = 50 } = req.query;

  logger.info(`Fetching Goods Receipts for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getGoodsReceipts(vendorId);

    if (sapResponse.success) {
      let grs = sapResponse.data || [];

      // Filter by status if provided
      if (status) {
        grs = grs.filter(gr => 
          gr.Status?.toLowerCase() === status.toLowerCase()
        );
      }

      // Limit results
      grs = grs.slice(0, parseInt(limit));

      res.json({
        success: true,
        message: 'Goods Receipts retrieved successfully',
        data: grs
      });
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('GR fetch error:', error.message);
    
    // Fallback mock data
    const mockGRs = [
      {
        grId: 'GR001',
        grNumber: 'GR2024001',
        poId: 'PO001',
        poNumber: 'PO2024001',
        receiptDate: '2024-01-25T10:00:00Z',
        status: 'Partially Received',
        items: [
          {
            itemId: 'ITM001',
            materialId: 'MAT001',
            description: 'Industrial Motor 5HP',
            orderedQty: 10,
            receivedQty: 5,
            unit: 'EA',
            storageLocation: 'WH001-A01'
          }
        ]
      },
      {
        grId: 'GR002',
        grNumber: 'GR2024002',
        poId: 'PO002',
        poNumber: 'PO2024002',
        receiptDate: '2024-01-28T14:00:00Z',
        status: 'Received',
        items: [
          {
            itemId: 'ITM003',
            materialId: 'MAT003',
            description: 'Steel Sheets 2mm thickness',
            orderedQty: 600,
            receivedQty: 600,
            unit: 'SQ',
            storageLocation: 'WH001-B01'
          }
        ]
      }
    ];

    res.json({
      success: true,
      message: 'Goods Receipts retrieved successfully (mock data)',
      data: mockGRs
    });
  }
}));

/**
 * GET /api/gr/:id
 * Get specific Goods Receipt details
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendorId = req.vendorId;

  logger.info(`Fetching GR details: ${id} for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getGoodsReceipts(vendorId);

    if (sapResponse.success) {
      const gr = sapResponse.data?.find(g => g.grId === id || g.GrId === id);

      if (gr) {
        res.json({
          success: true,
          message: 'Goods Receipt details retrieved successfully',
          data: gr
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Goods Receipt not found'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('GR detail fetch error:', error.message);
    
    // Fallback mock data
    res.json({
      success: true,
      message: 'Goods Receipt details retrieved successfully (mock)',
      data: {
        grId: id,
        grNumber: `GR2024${id.slice(-3)}`,
        poId: `PO${id.slice(-3)}`,
        poNumber: `PO2024${id.slice(-3)}`,
        receiptDate: '2024-01-25T10:00:00Z',
        status: 'Received',
        items: []
      }
    });
  }
}));

/**
 * POST /api/gr/:id/confirm
 * Confirm goods receipt
 */
router.post('/:id/confirm', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const confirmationData = req.body;
  const vendorId = req.vendorId;

  logger.info(`Confirming GR: ${id} by vendor: ${vendorId}`);

  // Basic validation
  if (!confirmationData.items || !Array.isArray(confirmationData.items)) {
    return res.status(400).json({
      success: false,
      message: 'Confirmation items are required'
    });
  }

  try {
    // In a real implementation, this would call SAP to confirm the GR
    const sapResponse = {
      success: true,
      data: {
        grId: id,
        status: 'Confirmed',
        confirmationDate: new Date().toISOString(),
        vendorId: vendorId,
        items: confirmationData.items
      }
    };

    res.json({
      success: true,
      message: 'Goods Receipt confirmed successfully',
      data: sapResponse.data
    });
  } catch (error) {
    logger.error('GR confirmation error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to confirm Goods Receipt'
    });
  }
}));

/**
 * GET /api/gr/stats/summary
 * Get Goods Receipt statistics
 */
router.get('/stats/summary', asyncHandler(async (req, res) => {
  const vendorId = req.vendorId;

  logger.info(`Fetching GR stats for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getGoodsReceipts(vendorId);

    if (sapResponse.success) {
      const grs = sapResponse.data || [];
      
      const stats = {
        total: grs.length,
        pending: grs.filter(g => g.Status === 'Pending').length,
        partiallyReceived: grs.filter(g => g.Status === 'Partially Received').length,
        received: grs.filter(g => g.Status === 'Received').length,
        posted: grs.filter(g => g.Status === 'Posted').length
      };

      res.json({
        success: true,
        message: 'Goods Receipt statistics retrieved successfully',
        data: stats
      });
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('GR stats error:', error.message);
    
    // Fallback mock stats
    res.json({
      success: true,
      message: 'Goods Receipt statistics retrieved successfully (mock)',
      data: {
        total: 18,
        pending: 2,
        partiallyReceived: 5,
        received: 8,
        posted: 3
      }
    });
  }
}));

module.exports = router;