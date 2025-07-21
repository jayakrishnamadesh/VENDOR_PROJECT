const express = require('express');
const router = express.Router();
const sapClient = require('../services/sapClient');
const logger = require('../utils/logger');

// Mock PO data
const mockPOs = [
  {
    poNumber: 'PO001',
    title: 'Office Supplies Order',
    status: 'Confirmed',
    orderDate: '2024-01-20',
    deliveryDate: '2024-02-05',
    totalAmount: 24500,
    currency: 'USD',
    items: [
      { itemId: 'ITEM001', description: 'Office Chairs', quantity: 50, unitPrice: 450, totalPrice: 22500 },
      { itemId: 'ITEM002', description: 'Desk Lamps', quantity: 30, unitPrice: 67, totalPrice: 2000 }
    ]
  },
  {
    poNumber: 'PO002',
    title: 'IT Equipment Order',
    status: 'In Progress',
    orderDate: '2024-01-25',
    deliveryDate: '2024-02-10',
    totalAmount: 73500,
    currency: 'USD',
    items: [
      { itemId: 'ITEM003', description: 'Laptops', quantity: 25, unitPrice: 2800, totalPrice: 70000 },
      { itemId: 'ITEM004', description: 'Wireless Mice', quantity: 25, unitPrice: 140, totalPrice: 3500 }
    ]
  }
];

// Get all Purchase Orders for vendor
router.get('/', async (req, res, next) => {
  try {
    const vendorId = req.user.vendorId;

    try {
      const sapResponse = await sapClient.get('/PURCHASEORDERSET', {
        $filter: `VendorId eq '${vendorId}'`,
        $orderby: 'OrderDate desc'
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
      logger.warn('SAP PO fetch failed, using mock data:', sapError.message);
      res.json({
        success: true,
        data: mockPOs
      });
    }
  } catch (error) {
    next(error);
  }
});

// Get specific Purchase Order
router.get('/:poNumber', async (req, res, next) => {
  try {
    const { poNumber } = req.params;
    const vendorId = req.user.vendorId;

    try {
      const sapResponse = await sapClient.get(`/PURCHASEORDERSET('${poNumber}')`, {
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
          error: { message: 'Purchase Order not found' }
        });
      }
    } catch (sapError) {
      logger.warn('SAP PO detail fetch failed, using mock data:', sapError.message);
      const mockPO = mockPOs.find(po => po.poNumber === poNumber);
      if (mockPO) {
        res.json({
          success: true,
          data: mockPO
        });
      } else {
        res.status(404).json({
          success: false,
          error: { message: 'Purchase Order not found' }
        });
      }
    }
  } catch (error) {
    next(error);
  }
});

// Acknowledge Purchase Order
router.post('/:poNumber/acknowledge', async (req, res, next) => {
  try {
    const { poNumber } = req.params;
    const vendorId = req.user.vendorId;

    try {
      const sapResponse = await sapClient.put(`/PURCHASEORDERSET('${poNumber}')`, {
        Status: 'Acknowledged',
        AcknowledgedDate: new Date().toISOString(),
        VendorId: vendorId
      });

      res.json({
        success: true,
        message: 'Purchase Order acknowledged successfully',
        data: sapResponse.d
      });
    } catch (sapError) {
      logger.warn('SAP PO acknowledgment failed:', sapError.message);
      res.json({
        success: true,
        message: 'Purchase Order acknowledged successfully (mock)',
        data: {
          poNumber,
          status: 'Acknowledged',
          acknowledgedDate: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;