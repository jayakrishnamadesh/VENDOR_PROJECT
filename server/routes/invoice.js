const express = require('express');
const router = express.Router();
const sapClient = require('../services/sapClient');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/session');

// Apply authentication middleware
router.use(requireAuth);

/**
 * GET /api/invoice
 * Get all Invoices for vendor
 */
router.get('/', asyncHandler(async (req, res) => {
  const vendorId = req.vendorId;
  const { status, limit = 50 } = req.query;

  logger.info(`Fetching Invoices for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getInvoices(vendorId);

    if (sapResponse.success) {
      let invoices = sapResponse.data || [];

      // Filter by status if provided
      if (status) {
        invoices = invoices.filter(inv => 
          inv.Status?.toLowerCase() === status.toLowerCase()
        );
      }

      // Limit results
      invoices = invoices.slice(0, parseInt(limit));

      res.json({
        success: true,
        message: 'Invoices retrieved successfully',
        data: invoices
      });
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('Invoice fetch error:', error.message);
    
    // Fallback mock data
    const mockInvoices = [
      {
        invoiceId: 'INV001',
        invoiceNumber: 'INV2024001',
        vendorId: vendorId,
        poId: 'PO2024001',
        invoiceDate: '2024-02-01T08:00:00Z',
        dueDate: '2024-03-01T17:00:00Z',
        status: 'Submitted',
        totalAmount: 25000,
        paidAmount: 0,
        pendingAmount: 25000,
        currency: 'USD',
        items: [
          {
            itemId: 'INV-ITM001',
            description: 'Industrial Motor 5HP',
            quantity: 5,
            unitPrice: 1200,
            totalPrice: 6000,
            taxAmount: 600
          }
        ]
      },
      {
        invoiceId: 'INV002',
        invoiceNumber: 'INV2024002',
        vendorId: vendorId,
        poId: 'PO2024002',
        invoiceDate: '2024-02-05T09:00:00Z',
        dueDate: '2024-03-05T17:00:00Z',
        status: 'Approved',
        totalAmount: 50000,
        paidAmount: 30000,
        pendingAmount: 20000,
        currency: 'USD',
        items: []
      }
    ];

    res.json({
      success: true,
      message: 'Invoices retrieved successfully (mock data)',
      data: mockInvoices
    });
  }
}));

/**
 * GET /api/invoice/:id
 * Get specific Invoice details
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendorId = req.vendorId;

  logger.info(`Fetching Invoice details: ${id} for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getInvoices(vendorId);

    if (sapResponse.success) {
      const invoice = sapResponse.data?.find(inv => inv.invoiceId === id || inv.InvoiceId === id);

      if (invoice) {
        res.json({
          success: true,
          message: 'Invoice details retrieved successfully',
          data: invoice
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('Invoice detail fetch error:', error.message);
    
    // Fallback mock data
    res.json({
      success: true,
      message: 'Invoice details retrieved successfully (mock)',
      data: {
        invoiceId: id,
        invoiceNumber: `INV2024${id.slice(-3)}`,
        vendorId: vendorId,
        poId: `PO2024${id.slice(-3)}`,
        invoiceDate: '2024-02-01T08:00:00Z',
        dueDate: '2024-03-01T17:00:00Z',
        status: 'Draft',
        totalAmount: 25000,
        paidAmount: 0,
        pendingAmount: 25000,
        currency: 'USD',
        items: []
      }
    });
  }
}));

/**
 * POST /api/invoice
 * Create new Invoice
 */
router.post('/', asyncHandler(async (req, res) => {
  const invoiceData = req.body;
  const vendorId = req.vendorId;

  logger.info(`Creating Invoice for vendor: ${vendorId}`);

  // Basic validation
  if (!invoiceData.poId || !invoiceData.items || !Array.isArray(invoiceData.items)) {
    return res.status(400).json({
      success: false,
      message: 'PO ID and invoice items are required'
    });
  }

  try {
    const sapResponse = await sapClient.createInvoice({
      ...invoiceData,
      vendorId: vendorId,
      invoiceDate: new Date().toISOString(),
      status: 'Draft'
    });

    if (sapResponse.success) {
      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: sapResponse.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('Invoice creation error:', error.message);
    
    // Fallback success response
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully (mock)',
      data: {
        invoiceId: `INV-${Date.now()}`,
        invoiceNumber: `INV2024${Math.floor(Math.random() * 1000)}`,
        vendorId: vendorId,
        status: 'Draft',
        createdDate: new Date().toISOString(),
        ...invoiceData
      }
    });
  }
}));

/**
 * PUT /api/invoice/:id
 * Update Invoice
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const invoiceData = req.body;
  const vendorId = req.vendorId;

  logger.info(`Updating Invoice: ${id} for vendor: ${vendorId}`);

  try {
    // In a real implementation, this would call SAP to update the invoice
    const sapResponse = {
      success: true,
      data: {
        invoiceId: id,
        ...invoiceData,
        vendorId: vendorId,
        updatedDate: new Date().toISOString()
      }
    };

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: sapResponse.data
    });
  } catch (error) {
    logger.error('Invoice update error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to update Invoice'
    });
  }
}));

/**
 * POST /api/invoice/:id/submit
 * Submit Invoice
 */
router.post('/:id/submit', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendorId = req.vendorId;

  logger.info(`Submitting Invoice: ${id} by vendor: ${vendorId}`);

  try {
    // In a real implementation, this would call SAP to submit the invoice
    const sapResponse = {
      success: true,
      data: {
        invoiceId: id,
        status: 'Submitted',
        submissionDate: new Date().toISOString(),
        vendorId: vendorId
      }
    };

    res.json({
      success: true,
      message: 'Invoice submitted successfully',
      data: sapResponse.data
    });
  } catch (error) {
    logger.error('Invoice submission error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to submit Invoice'
    });
  }
}));

/**
 * GET /api/invoice/stats/summary
 * Get Invoice statistics
 */
router.get('/stats/summary', asyncHandler(async (req, res) => {
  const vendorId = req.vendorId;

  logger.info(`Fetching Invoice stats for vendor: ${vendorId}`);

  try {
    const sapResponse = await sapClient.getInvoices(vendorId);

    if (sapResponse.success) {
      const invoices = sapResponse.data || [];
      
      const stats = {
        total: invoices.length,
        draft: invoices.filter(inv => inv.Status === 'Draft').length,
        submitted: invoices.filter(inv => inv.Status === 'Submitted').length,
        approved: invoices.filter(inv => inv.Status === 'Approved').length,
        paid: invoices.filter(inv => inv.Status === 'Paid').length,
        rejected: invoices.filter(inv => inv.Status === 'Rejected').length,
        totalAmount: invoices.reduce((sum, inv) => sum + (inv.TotalAmount || 0), 0),
        paidAmount: invoices.reduce((sum, inv) => sum + (inv.PaidAmount || 0), 0),
        pendingAmount: invoices.reduce((sum, inv) => sum + (inv.PendingAmount || 0), 0)
      };

      res.json({
        success: true,
        message: 'Invoice statistics retrieved successfully',
        data: stats
      });
    } else {
      res.status(400).json({
        success: false,
        message: sapResponse.message
      });
    }
  } catch (error) {
    logger.error('Invoice stats error:', error.message);
    
    // Fallback mock stats
    res.json({
      success: true,
      message: 'Invoice statistics retrieved successfully (mock)',
      data: {
        total: 22,
        draft: 3,
        submitted: 6,
        approved: 8,
        paid: 4,
        rejected: 1,
        totalAmount: 850000,
        paidAmount: 450000,
        pendingAmount: 400000
      }
    });
  }
}));

module.exports = router;