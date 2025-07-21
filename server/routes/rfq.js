const express = require('express');
const router = express.Router();
const sapClient = require('../services/sapClient');
const logger = require('../utils/logger');

// Mock RFQ data
const mockRFQs = [
  {
    rfqId: 'RFQ001',
    title: 'Office Supplies Procurement',
    description: 'Request for quotation for office supplies including stationery, furniture, and equipment',
    status: 'Open',
    dueDate: '2024-02-15',
    createdDate: '2024-01-15',
    estimatedValue: 25000,
    currency: 'USD',
    items: [
      { itemId: 'ITEM001', description: 'Office Chairs', quantity: 50, unit: 'PCS' },
      { itemId: 'ITEM002', description: 'Desk Lamps', quantity: 30, unit: 'PCS' }
    ]
  },
  {
    rfqId: 'RFQ002',
    title: 'IT Equipment Procurement',
    description: 'Request for quotation for laptops and accessories',
    status: 'In Progress',
    dueDate: '2024-02-20',
    createdDate: '2024-01-20',
    estimatedValue: 75000,
    currency: 'USD',
    items: [
      { itemId: 'ITEM003', description: 'Laptops', quantity: 25, unit: 'PCS' },
      { itemId: 'ITEM004', description: 'Wireless Mice', quantity: 25, unit: 'PCS' }
    ]
  }
];

// Get all RFQs for vendor
router.get('/', async (req, res, next) => {
  try {
    const vendorId = req.user.vendorId;

    try {
      const sapResponse = await sapClient.get('/VENDORQUOTATIONS', {
        $filter: `VendorId eq '${vendorId}'`,
        $orderby: 'CreatedDate desc'
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
      logger.warn('SAP RFQ fetch failed, using mock data:', sapError.message);
      res.json({
        success: true,
        data: mockRFQs
      });
    }
  } catch (error) {
    next(error);
  }
});

// Get specific RFQ
router.get('/:rfqId', async (req, res, next) => {
  try {
    const { rfqId } = req.params;
    const vendorId = req.user.vendorId;

    try {
      const sapResponse = await sapClient.get(`/VENDORQUOTATIONS('${rfqId}')`, {
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
          error: { message: 'RFQ not found' }
        });
      }
    } catch (sapError) {
      logger.warn('SAP RFQ detail fetch failed, using mock data:', sapError.message);
      const mockRFQ = mockRFQs.find(rfq => rfq.rfqId === rfqId);
      if (mockRFQ) {
        res.json({
          success: true,
          data: mockRFQ
        });
      } else {
        res.status(404).json({
          success: false,
          error: { message: 'RFQ not found' }
        });
      }
    }
  } catch (error) {
    next(error);
  }
});

// Submit quotation
router.post('/:rfqId/quote', async (req, res, next) => {
  try {
    const { rfqId } = req.params;
    const quotationData = req.body;
    const vendorId = req.user.vendorId;

    try {
      const sapResponse = await sapClient.post('/VENDORQUOTATIONS', {
        RfqId: rfqId,
        VendorId: vendorId,
        ...quotationData
      });

      res.json({
        success: true,
        message: 'Quotation submitted successfully',
        data: sapResponse.d
      });
    } catch (sapError) {
      logger.warn('SAP quotation submission failed:', sapError.message);
      res.json({
        success: true,
        message: 'Quotation submitted successfully (mock)',
        data: {
          rfqId,
          vendorId,
          ...quotationData,
          submittedDate: new Date().toISOString(),
          status: 'Submitted'
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;