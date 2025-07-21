const express = require('express');
const router = express.Router();
const sapClient = require('../services/sapClient');
const logger = require('../utils/logger');

// Mock Aging data
const mockAging = [
  {
    invoiceNumber: 'INV002',
    invoiceDate: '2024-02-09',
    dueDate: '2024-03-09',
    amount: 73500,
    currency: 'USD',
    daysOverdue: 0,
    agingBucket: 'Current',
    status: 'Pending'
  },
  {
    invoiceNumber: 'INV003',
    invoiceDate: '2024-01-15',
    dueDate: '2024-02-15',
    amount: 15000,
    currency: 'USD',
    daysOverdue: 15,
    agingBucket: '1-30 Days',
    status: 'Overdue'
  },
  {
    invoiceNumber: 'INV004',
    invoiceDate: '2023-12-20',
    dueDate: '2024-01-20',
    amount: 8500,
    currency: 'USD',
    daysOverdue: 45,
    agingBucket: '31-60 Days',
    status: 'Overdue'
  }
];

// Get aging report for vendor
router.get('/', async (req, res, next) => {
  try {
    const vendorId = req.user.vendorId;

    try {
      const sapResponse = await sapClient.get('/AGEINGSET', {
        $filter: `VendorId eq '${vendorId}'`,
        $orderby: 'DueDate asc'
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
      logger.warn('SAP Aging fetch failed, using mock data:', sapError.message);
      res.json({
        success: true,
        data: mockAging
      });
    }
  } catch (error) {
    next(error);
  }
});

// Get aging summary
router.get('/summary', async (req, res, next) => {
  try {
    const vendorId = req.user.vendorId;

    try {
      const sapResponse = await sapClient.get('/AGEINGSET', {
        $filter: `VendorId eq '${vendorId}'`
      });

      if (sapResponse.d && sapResponse.d.results) {
        const aging = sapResponse.d.results;
        const summary = {
          current: aging.filter(a => a.AgingBucket === 'Current').reduce((sum, a) => sum + a.Amount, 0),
          days1to30: aging.filter(a => a.AgingBucket === '1-30 Days').reduce((sum, a) => sum + a.Amount, 0),
          days31to60: aging.filter(a => a.AgingBucket === '31-60 Days').reduce((sum, a) => sum + a.Amount, 0),
          days61to90: aging.filter(a => a.AgingBucket === '61-90 Days').reduce((sum, a) => sum + a.Amount, 0),
          over90Days: aging.filter(a => a.AgingBucket === 'Over 90 Days').reduce((sum, a) => sum + a.Amount, 0),
          totalOutstanding: aging.reduce((sum, a) => sum + a.Amount, 0)
        };

        res.json({
          success: true,
          data: summary
        });
      } else {
        res.json({
          success: true,
          data: {
            current: 0,
            days1to30: 0,
            days31to60: 0,
            days61to90: 0,
            over90Days: 0,
            totalOutstanding: 0
          }
        });
      }
    } catch (sapError) {
      logger.warn('SAP Aging summary fetch failed, using mock data:', sapError.message);
      res.json({
        success: true,
        data: {
          current: 73500,
          days1to30: 15000,
          days31to60: 8500,
          days61to90: 0,
          over90Days: 0,
          totalOutstanding: 97000
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;