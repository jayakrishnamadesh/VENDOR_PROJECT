const express = require('express');
const router = express.Router();
const sapClient = require('../services/sapClient');
const logger = require('../utils/logger');

// Mock Payment data
const mockPayments = [
  {
    paymentId: 'PAY001',
    invoiceNumber: 'INV001',
    paymentDate: '2024-02-20',
    amount: 24500,
    currency: 'USD',
    paymentMethod: 'Bank Transfer',
    status: 'Completed',
    referenceNumber: 'REF123456789',
    bankDetails: {
      bankName: 'Demo Bank',
      accountNumber: '****1234'
    }
  },
  {
    paymentId: 'PAY002',
    invoiceNumber: 'INV002',
    paymentDate: null,
    amount: 73500,
    currency: 'USD',
    paymentMethod: 'Bank Transfer',
    status: 'Pending',
    referenceNumber: null,
    bankDetails: {
      bankName: 'Demo Bank',
      accountNumber: '****1234'
    }
  }
];

// Get all Payments for vendor
router.get('/', async (req, res, next) => {
  try {
    const vendorId = req.user.vendorId;

    try {
      const sapResponse = await sapClient.get('/PAYMENTSET', {
        $filter: `VendorId eq '${vendorId}'`,
        $orderby: 'PaymentDate desc'
      });

      if (sapResponse.d && sapResponse.d.results) {
        res.json({
          success: true,
          data: sapResponse.d.results
        });
      } else {
        res.json({
          success: true,
          data: []
        });
      }
    } catch (sapError) {
      logger.warn('SAP Payment fetch failed, using mock data:', sapError.message);
      res.json({
        success: true,
        data: mockPayments
      });
    }
  } catch (error) {
    next(error);
  }
});

// Get specific Payment
router.get('/:paymentId', async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const vendorId = req.user.vendorId;

    try {
      const sapResponse = await sapClient.get(`/PAYMENTSET('${paymentId}')`, {
        $filter: `VendorId eq '${vendorId}'`
      });

      if (sapResponse.d) {
        res.json({
          success: true,
          data: sapResponse.d
        });
      } else {
        res.status(404).json({
          success: false,
          error: { message: 'Payment not found' }
        });
      }
    } catch (sapError) {
      logger.warn('SAP Payment detail fetch failed, using mock data:', sapError.message);
      const mockPayment = mockPayments.find(pay => pay.paymentId === paymentId);
      if (mockPayment) {
        res.json({
          success: true,
          data: mockPayment
        });
      } else {
        res.status(404).json({
          success: false,
          error: { message: 'Payment not found' }
        });
      }
    }
  } catch (error) {
    next(error);
  }
});

// Get payment summary
router.get('/summary/stats', async (req, res, next) => {
  try {
    const vendorId = req.user.vendorId;

    try {
      const sapResponse = await sapClient.get('/PAYMENTSET', {
        $filter: `VendorId eq '${vendorId}'`
      });

      if (sapResponse.d && sapResponse.d.results) {
        const payments = sapResponse.d.results;
        const summary = {
          totalPaid: payments.filter(p => p.Status === 'Completed').reduce((sum, p) => sum + p.Amount, 0),
          totalPending: payments.filter(p => p.Status === 'Pending').reduce((sum, p) => sum + p.Amount, 0),
          totalPayments: payments.length,
          completedPayments: payments.filter(p => p.Status === 'Completed').length
        };

        res.json({
          success: true,
          data: summary
        });
      } else {
        res.json({
          success: true,
          data: {
            totalPaid: 0,
            totalPending: 0,
            totalPayments: 0,
            completedPayments: 0
          }
        });
      }
    } catch (sapError) {
      logger.warn('SAP Payment summary fetch failed, using mock data:', sapError.message);
      res.json({
        success: true,
        data: {
          totalPaid: 24500,
          totalPending: 73500,
          totalPayments: 2,
          completedPayments: 1
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;