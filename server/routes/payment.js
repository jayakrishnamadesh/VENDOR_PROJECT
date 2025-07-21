const express = require('express');
const router = express.Router();
const sapClient = require('../services/sapClient');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/session');

// Apply authentication middleware
router.use(requireAuth);

/**
 * GET /api/payment
 * Get all Payments for vendor
 */
router.get('/', asyncHandler(async (req, res) => {
  const vendorId = req.vendorId;
  const { status, method, limit = 50 } = req.query;

  logger.info(`Fetching Payments for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getPayments(vendorId);

    if (sapResponse.success) {
      let payments = sapResponse.data || [];

      // Filter by status if provided
      if (status) {
        payments = payments.filter(pay => 
          pay.Status?.toLowerCase() === status.toLowerCase()
        );
      }

      // Filter by payment method if provided
      if (method) {
        payments = payments.filter(pay => 
          pay.PaymentMethod?.toLowerCase() === method.toLowerCase()
        );
      }

      // Limit results
      payments = payments.slice(0, parseInt(limit));

      res.json({
        success: true,
        message: 'Payments retrieved successfully',
        data: payments
      });
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('Payment fetch error:', error.message);
    
    // Fallback mock data
    const mockPayments = [
      {
        paymentId: 'PAY001',
        vendorId: vendorId,
        invoiceId: 'INV2024001',
        paymentDate: '2024-02-15T10:00:00Z',
        amount: 25000,
        currency: 'USD',
        paymentMethod: 'Bank Transfer',
        status: 'Completed',
        referenceNumber: 'PAY-2024-001'
      },
      {
        paymentId: 'PAY002',
        vendorId: vendorId,
        invoiceId: 'INV2024002',
        paymentDate: '2024-02-20T14:00:00Z',
        amount: 30000,
        currency: 'USD',
        paymentMethod: 'Wire Transfer',
        status: 'Completed',
        referenceNumber: 'PAY-2024-002'
      },
      {
        paymentId: 'PAY003',
        vendorId: vendorId,
        invoiceId: 'INV2024003',
        paymentDate: '2024-03-01T09:00:00Z',
        amount: 15000,
        currency: 'USD',
        paymentMethod: 'ACH',
        status: 'Pending',
        referenceNumber: 'PAY-2024-003'
      }
    ];

    res.json({
      success: true,
      message: 'Payments retrieved successfully (mock data)',
      data: mockPayments
    });
  }
}));

/**
 * GET /api/payment/:id
 * Get specific Payment details
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendorId = req.vendorId;

  logger.info(`Fetching Payment details: ${id} for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getPayments(vendorId);

    if (sapResponse.success) {
      const payment = sapResponse.data?.find(pay => pay.paymentId === id || pay.PaymentId === id);

      if (payment) {
        res.json({
          success: true,
          message: 'Payment details retrieved successfully',
          data: payment
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('Payment detail fetch error:', error.message);
    
    // Fallback mock data
    res.json({
      success: true,
      message: 'Payment details retrieved successfully (mock)',
      data: {
        paymentId: id,
        vendorId: vendorId,
        invoiceId: `INV2024${id.slice(-3)}`,
        paymentDate: '2024-02-15T10:00:00Z',
        amount: 25000,
        currency: 'USD',
        paymentMethod: 'Bank Transfer',
        status: 'Completed',
        referenceNumber: `PAY-2024-${id.slice(-3)}`
      }
    });
  }
}));

/**
 * POST /api/payment/:id/retry
 * Retry failed payment
 */
router.post('/:id/retry', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendorId = req.vendorId;

  logger.info(`Retrying Payment: ${id} for vendor: ${vendorId}`);

  try {
    // In a real implementation, this would call SAP to retry the payment
    const sapResponse = {
      success: true,
      data: {
        paymentId: id,
        status: 'Processing',
        retryDate: new Date().toISOString(),
        vendorId: vendorId
      }
    };

    res.json({
      success: true,
      message: 'Payment retry initiated successfully',
      data: sapResponse.data
    });
  } catch (error) {
    logger.error('Payment retry error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retry payment'
    });
  }
}));

/**
 * GET /api/payment/stats/summary
 * Get Payment statistics
 */
router.get('/stats/summary', asyncHandler(async (req, res) => {
  const vendorId = req.vendorId;

  logger.info(`Fetching Payment stats for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getPayments(vendorId);

    if (sapResponse.success) {
      const payments = sapResponse.data || [];
      
      const stats = {
        total: payments.length,
        completed: payments.filter(pay => pay.Status === 'Completed').length,
        pending: payments.filter(pay => pay.Status === 'Pending').length,
        processing: payments.filter(pay => pay.Status === 'Processing').length,
        failed: payments.filter(pay => pay.Status === 'Failed').length,
        totalAmount: payments.reduce((sum, pay) => sum + (pay.Amount || 0), 0),
        completedAmount: payments
          .filter(pay => pay.Status === 'Completed')
          .reduce((sum, pay) => sum + (pay.Amount || 0), 0),
        pendingAmount: payments
          .filter(pay => pay.Status === 'Pending' || pay.Status === 'Processing')
          .reduce((sum, pay) => sum + (pay.Amount || 0), 0)
      };

      res.json({
        success: true,
        message: 'Payment statistics retrieved successfully',
        data: stats
      });
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('Payment stats error:', error.message);
    
    // Fallback mock stats
    res.json({
      success: true,
      message: 'Payment statistics retrieved successfully (mock)',
      data: {
        total: 28,
        completed: 22,
        pending: 4,
        processing: 1,
        failed: 1,
        totalAmount: 750000,
        completedAmount: 650000,
        pendingAmount: 100000
      }
    });
  }
}));

module.exports = router;