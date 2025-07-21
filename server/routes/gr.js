const express = require('express');
const router = express.Router();
const sapClient = require('../services/sapClient');
const logger = require('../utils/logger');

// Mock GR data
const mockGRs = [
  {
    grNumber: 'GR001',
    poNumber: 'PO001',
    title: 'Office Supplies Delivery',
    status: 'Completed',
    deliveryDate: '2024-02-05',
    receivedDate: '2024-02-05',
    totalQuantity: 80,
    items: [
      { itemId: 'ITEM001', description: 'Office Chairs', orderedQty: 50, receivedQty: 50, status: 'Complete' },
      { itemId: 'ITEM002', description: 'Desk Lamps', orderedQty: 30, receivedQty: 30, status: 'Complete' }
    ]
  },
  {
    grNumber: 'GR002',
    poNumber: 'PO002',
    title: 'IT Equipment Delivery',
    status: 'Partial',
    deliveryDate: '2024-02-10',
    receivedDate: '2024-02-08',
    totalQuantity: 40,
    items: [
      { itemId: 'ITEM003', description: 'Laptops', orderedQty: 25, receivedQty: 20, status: 'Partial' },
      { itemId: 'ITEM004', description: 'Wireless Mice', orderedQty: 25, receivedQty: 25, status: 'Complete' }
    ]
  }
];

// Get all Goods Receipts for vendor
router.get('/', async (req, res, next) => {
  try {
    const vendorId = req.user.vendorId;

    try {
      const sapResponse = await sapClient.get('/GOODSRECEIPTSET', {
        $filter: `VendorId eq '${vendorId}'`,
        $orderby: 'ReceivedDate desc'
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
      logger.warn('SAP GR fetch failed, using mock data:', sapError.message);
      res.json({
        success: true,
        data: mockGRs
      });
    }
  } catch (error) {
    next(error);
  }
});

// Get specific Goods Receipt
router.get('/:grNumber', async (req, res, next) => {
  try {
    const { grNumber } = req.params;
    const vendorId = req.user.vendorId;

    try {
      const sapResponse = await sapClient.get(`/GOODSRECEIPTSET('${grNumber}')`, {
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
          error: { message: 'Goods Receipt not found' }
        });
      }
    } catch (sapError) {
      logger.warn('SAP GR detail fetch failed, using mock data:', sapError.message);
      const mockGR = mockGRs.find(gr => gr.grNumber === grNumber);
      if (mockGR) {
        res.json({
          success: true,
          data: mockGR
        });
      } else {
        res.status(404).json({
          success: false,
          error: { message: 'Goods Receipt not found' }
        });
      }
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;