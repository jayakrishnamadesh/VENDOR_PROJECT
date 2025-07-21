const express = require('express');
const router = express.Router();
const sapClient = require('../services/sapClient');
const logger = require('../utils/logger');

// Mock Invoice data
const mockInvoices = [
  {
    invoiceNumber: 'INV001',
    poNumber: 'PO001',
    grNumber: 'GR001',
    title: 'Office Supplies Invoice',
    status: 'Paid',
    invoiceDate: '2024-02-06',
    dueDate: '2024-03-06',
    paidDate: '2024-02-20',
    totalAmount: 24500,
    paidAmount: 24500,
    currency: 'USD',
    items: [
      { itemId: 'ITEM001', description: 'Office Chairs', quantity: 50, unitPrice: 450, totalPrice: 22500 },
      { itemId: 'ITEM002', description: 'Desk Lamps', quantity: 30, unitPrice: 67, totalPrice: 2000 }
    ]
  },
  {
    invoiceNumber: 'INV002',
    poNumber: 'PO002',
    grNumber: 'GR002',
    title: 'IT Equipment Invoice',
    status: 'Pending',
    invoiceDate: '2024-02-09',
    dueDate: '2024-03-09',
    paidDate: null,
    totalAmount: 73500,
    paidAmount: 0,
    currency: 'USD',
    items: [
      { itemId: 'ITEM003', description: 'Laptops', quantity: 25, unitPrice: 2800, totalPrice: 70000 },
      { itemId: 'ITEM004', description: 'Wireless Mice', quantity: 25, unitPrice: 140, totalPrice: 3500 }
    ]
  }
];

// Get all Invoices for vendor
router.get('/', async (req, res, next) => {
  try {
    const vendorId = req.user.vendorId;

    try {
      const sapResponse = await sapClient.get('/INVOICESET', {
        $filter: `VendorId eq '${vendorId}'`,
        $orderby: 'InvoiceDate desc'
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
      logger.warn('SAP Invoice fetch failed, using mock data:', sapError.message);
      res.json({
        success: true,
        data: mockInvoices
      });
    }
  } catch (error) {
    next(error);
  }
});

// Get specific Invoice
router.get('/:invoiceNumber', async (req, res, next) => {
  try {
    const { invoiceNumber } = req.params;
    const vendorId = req.user.vendorId;

    try {
      const sapResponse = await sapClient.get(`/INVOICESET('${invoiceNumber}')`, {
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
          error: { message: 'Invoice not found' }
        });
      }
    } catch (sapError) {
      logger.warn('SAP Invoice detail fetch failed, using mock data:', sapError.message);
      const mockInvoice = mockInvoices.find(inv => inv.invoiceNumber === invoiceNumber);
      if (mockInvoice) {
        res.json({
          success: true,
          data: mockInvoice
        });
      } else {
        res.status(404).json({
          success: false,
          error: { message: 'Invoice not found' }
        });
      }
    }
  } catch (error) {
    next(error);
  }
});

// Submit Invoice
router.post('/', async (req, res, next) => {
  try {
    const invoiceData = req.body;
    const vendorId = req.user.vendorId;

    try {
      const sapResponse = await sapClient.post('/INVOICESET', {
        VendorId: vendorId,
        ...invoiceData,
        InvoiceDate: new Date().toISOString(),
        Status: 'Submitted'
      });

      res.json({
        success: true,
        message: 'Invoice submitted successfully',
        data: sapResponse.d
      });
    } catch (sapError) {
      logger.warn('SAP Invoice submission failed:', sapError.message);
      res.json({
        success: true,
        message: 'Invoice submitted successfully (mock)',
        data: {
          invoiceNumber: `INV${Date.now()}`,
          vendorId,
          ...invoiceData,
          invoiceDate: new Date().toISOString(),
          status: 'Submitted'
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;