const axios = require('axios');
const logger = require('../utils/logger');

/**
 * SAP OData Client Service
 * Handles all communication with SAP backend
 */
class SAPClient {
  constructor() {
    this.baseURL = process.env.SAP_BASE_URL;
    this.username = process.env.SAP_USERNAME;
    this.password = process.env.SAP_PASSWORD;
    
    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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
        logger.error(`SAP Response Error: ${error.response?.status} ${error.config?.url}`, error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Login vendor
   */
  async login(credentials) {
    try {
      const response = await this.client.post('/VENDORLOGINSET', {
        Username: credentials.username,
        Password: credentials.password
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Login successful'
      };
    } catch (error) {
      logger.error('SAP Login Error:', error.message);
      return this.handleError(error, 'Login failed');
    }
  }

  /**
   * Get vendor profile
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
   * Update vendor profile
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
   * Get RFQs
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
   * Get Purchase Orders
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
   * Get Goods Receipts
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
   * Get Invoices
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
   * Get Payments
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
   * Get Aging data
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
   * Submit quotation
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
   * Create invoice
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
   * Error handler
   */
  handleError(error, defaultMessage) {
    const errorMessage = error.response?.data?.error?.message?.value || 
                        error.response?.data?.message || 
                        error.message || 
                        defaultMessage;

    const statusCode = error.response?.status || 500;

    return {
      success: false,
      message: errorMessage,
      statusCode: statusCode,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/$metadata');
      return {
        success: true,
        message: 'SAP connection healthy',
        data: { status: 'connected' }
      };
    } catch (error) {
      return {
        success: false,
        message: 'SAP connection failed',
        error: error.message
      };
    }
  }
}

module.exports = new SAPClient();