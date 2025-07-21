const axios = require('axios');
const logger = require('../utils/logger');

/**
 * SAP OData Client Service
 * Handles all communication with SAP backend using OData v2
 */
class SAPClient {
  constructor() {
    this.baseURL = process.env.SAP_BASE_URL;
    this.username = process.env.SAP_USERNAME;
    this.password = process.env.SAP_PASSWORD;
    
    // Validate configuration
    if (!this.baseURL || !this.username || !this.password) {
      logger.error('SAP configuration missing. Check environment variables.');
    }
    
    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      auth: {
        username: this.username,
        password: this.password
      }
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.info(`SAP Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('SAP Request Error:', error.message);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.info(`SAP Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        const status = error.response?.status || 'Unknown';
        const url = error.config?.url || 'Unknown';
        logger.error(`SAP Response Error: ${status} ${url} - ${error.message}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Login vendor using VENDORLOGINSET
   */
  async login(credentials) {
    try {
      const response = await this.client.post('/VENDORLOGINSET', {
        Username: credentials.username,
        Password: credentials.password
      });
      
      return {
        success: true,
        data: response.data.d || response.data,
        message: 'Login successful'
      };
    } catch (error) {
      logger.error('SAP Login Error:', error.message);
      return this.handleError(error, 'Login failed');
    }
  }

  /**
   * Get vendor profile using PROFILESET
   */
  async getProfile(vendorId) {
    try {
      const response = await this.client.get(`/PROFILESET('${vendorId}')`);
      
      return {
        success: true,
        data: response.data.d || response.data,
        message: 'Profile retrieved successfully'
      };
    } catch (error) {
      logger.error('SAP Profile Error:', error.message);
      return this.handleError(error, 'Failed to fetch profile');
    }
  }

  /**
   * Update vendor profile using PROFILESET
   */
  async updateProfile(vendorId, profileData) {
    try {
      const response = await this.client.put(`/PROFILESET('${vendorId}')`, profileData);
      
      return {
        success: true,
        data: response.data.d || response.data,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      logger.error('SAP Profile Update Error:', error.message);
      return this.handleError(error, 'Failed to update profile');
    }
  }

  /**
   * Get RFQs using VENDORQUOTATIONS
   */
  async getRFQs(vendorId) {
    try {
      const response = await this.client.get(`/VENDORQUOTATIONS?$filter=VendorId eq '${vendorId}'`);
      
      return {
        success: true,
        data: response.data.d?.results || response.data.results || response.data,
        message: 'RFQs retrieved successfully'
      };
    } catch (error) {
      logger.error('SAP RFQ Error:', error.message);
      return this.handleError(error, 'Failed to fetch RFQs');
    }
  }

  /**
   * Submit quotation for RFQ
   */
  async submitQuotation(rfqId, quotationData) {
    try {
      const response = await this.client.post(`/VENDORQUOTATIONS('${rfqId}')/SubmitQuotation`, quotationData);
      
      return {
        success: true,
        data: response.data.d || response.data,
        message: 'Quotation submitted successfully'
      };
    } catch (error) {
      logger.error('SAP Quotation Error:', error.message);
      return this.handleError(error, 'Failed to submit quotation');
    }
  }

  /**
   * Get Purchase Orders using PURCHASEORDERSET
   */
  async getPurchaseOrders(vendorId) {
    try {
      const response = await this.client.get(`/PURCHASEORDERSET?$filter=VendorId eq '${vendorId}'`);
      
      return {
        success: true,
        data: response.data.d?.results || response.data.results || response.data,
        message: 'Purchase Orders retrieved successfully'
      };
    } catch (error) {
      logger.error('SAP PO Error:', error.message);
      return this.handleError(error, 'Failed to fetch Purchase Orders');
    }
  }

  /**
   * Acknowledge Purchase Order
   */
  async acknowledgePO(poId, acknowledgmentData) {
    try {
      const response = await this.client.post(`/PURCHASEORDERSET('${poId}')/Acknowledge`, acknowledgmentData);
      
      return {
        success: true,
        data: response.data.d || response.data,
        message: 'Purchase Order acknowledged successfully'
      };
    } catch (error) {
      logger.error('SAP PO Acknowledgment Error:', error.message);
      return this.handleError(error, 'Failed to acknowledge Purchase Order');
    }
  }

  /**
   * Get Goods Receipts using GOODSRECEIPTSET
   */
  async getGoodsReceipts(vendorId) {
    try {
      const response = await this.client.get(`/GOODSRECEIPTSET?$filter=VendorId eq '${vendorId}'`);
      
      return {
        success: true,
        data: response.data.d?.results || response.data.results || response.data,
        message: 'Goods Receipts retrieved successfully'
      };
    } catch (error) {
      logger.error('SAP GR Error:', error.message);
      return this.handleError(error, 'Failed to fetch Goods Receipts');
    }
  }

  /**
   * Confirm Goods Receipt
   */
  async confirmGoodsReceipt(grId, confirmationData) {
    try {
      const response = await this.client.post(`/GOODSRECEIPTSET('${grId}')/Confirm`, confirmationData);
      
      return {
        success: true,
        data: response.data.d || response.data,
        message: 'Goods Receipt confirmed successfully'
      };
    } catch (error) {
      logger.error('SAP GR Confirmation Error:', error.message);
      return this.handleError(error, 'Failed to confirm Goods Receipt');
    }
  }

  /**
   * Get Invoices using INVOICESET
   */
  async getInvoices(vendorId) {
    try {
      const response = await this.client.get(`/INVOICESET?$filter=VendorId eq '${vendorId}'`);
      
      return {
        success: true,
        data: response.data.d?.results || response.data.results || response.data,
        message: 'Invoices retrieved successfully'
      };
    } catch (error) {
      logger.error('SAP Invoice Error:', error.message);
      return this.handleError(error, 'Failed to fetch Invoices');
    }
  }

  /**
   * Create Invoice
   */
  async createInvoice(invoiceData) {
    try {
      const response = await this.client.post('/INVOICESET', invoiceData);
      
      return {
        success: true,
        data: response.data.d || response.data,
        message: 'Invoice created successfully'
      };
    } catch (error) {
      logger.error('SAP Create Invoice Error:', error.message);
      return this.handleError(error, 'Failed to create invoice');
    }
  }

  /**
   * Update Invoice
   */
  async updateInvoice(invoiceId, invoiceData) {
    try {
      const response = await this.client.put(`/INVOICESET('${invoiceId}')`, invoiceData);
      
      return {
        success: true,
        data: response.data.d || response.data,
        message: 'Invoice updated successfully'
      };
    } catch (error) {
      logger.error('SAP Update Invoice Error:', error.message);
      return this.handleError(error, 'Failed to update invoice');
    }
  }

  /**
   * Submit Invoice
   */
  async submitInvoice(invoiceId) {
    try {
      const response = await this.client.post(`/INVOICESET('${invoiceId}')/Submit`, {});
      
      return {
        success: true,
        data: response.data.d || response.data,
        message: 'Invoice submitted successfully'
      };
    } catch (error) {
      logger.error('SAP Submit Invoice Error:', error.message);
      return this.handleError(error, 'Failed to submit invoice');
    }
  }

  /**
   * Get Payments using PAYMENTSET
   */
  async getPayments(vendorId) {
    try {
      const response = await this.client.get(`/PAYMENTSET?$filter=VendorId eq '${vendorId}'`);
      
      return {
        success: true,
        data: response.data.d?.results || response.data.results || response.data,
        message: 'Payments retrieved successfully'
      };
    } catch (error) {
      logger.error('SAP Payment Error:', error.message);
      return this.handleError(error, 'Failed to fetch Payments');
    }
  }

  /**
   * Retry Payment
   */
  async retryPayment(paymentId) {
    try {
      const response = await this.client.post(`/PAYMENTSET('${paymentId}')/Retry`, {});
      
      return {
        success: true,
        data: response.data.d || response.data,
        message: 'Payment retry initiated successfully'
      };
    } catch (error) {
      logger.error('SAP Payment Retry Error:', error.message);
      return this.handleError(error, 'Failed to retry payment');
    }
  }

  /**
   * Get Aging data using AGEINGSET
   */
  async getAging(vendorId) {
    try {
      const response = await this.client.get(`/AGEINGSET?$filter=VendorId eq '${vendorId}'`);
      
      return {
        success: true,
        data: response.data.d?.results || response.data.results || response.data,
        message: 'Aging data retrieved successfully'
      };
    } catch (error) {
      logger.error('SAP Aging Error:', error.message);
      return this.handleError(error, 'Failed to fetch Aging data');
    }
  }

  /**
   * Health check for SAP connection
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/$metadata');
      return {
        success: true,
        message: 'SAP connection healthy',
        data: { status: 'connected', timestamp: new Date().toISOString() }
      };
    } catch (error) {
      return {
        success: false,
        message: 'SAP connection failed',
        error: error.message,
        data: { status: 'disconnected', timestamp: new Date().toISOString() }
      };
    }
  }

  /**
   * Error handler for SAP responses
   */
  handleError(error, defaultMessage) {
    let errorMessage = defaultMessage;
    let statusCode = 500;

    if (error.response) {
      // SAP returned an error response
      statusCode = error.response.status;
      
      // Try to extract SAP error message
      const sapError = error.response.data?.error?.message?.value || 
                      error.response.data?.message || 
                      error.response.data?.error?.innererror?.errordetails?.[0]?.message;
      
      if (sapError) {
        errorMessage = sapError;
      }
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      errorMessage = 'SAP service unavailable. Please check connection.';
      statusCode = 503;
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'SAP service timeout. Please try again.';
      statusCode = 504;
    }

    return {
      success: false,
      message: errorMessage,
      statusCode: statusCode,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}

module.exports = new SAPClient();