const axios = require('axios');
const logger = require('../utils/logger');

class SAPClient {
  constructor() {
    this.baseURL = process.env.SAP_BASE_URL;
    this.username = process.env.SAP_USERNAME;
    this.password = process.env.SAP_PASSWORD;
    
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
        logger.error('SAP Request Error:', error);
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
        logger.error('SAP Response Error:', error.message);
        return Promise.reject(error);
      }
    );
  }

  async get(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      logger.error(`SAP GET Error for ${endpoint}:`, error.message);
      throw this.handleError(error);
    }
  }

  async post(endpoint, data) {
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      logger.error(`SAP POST Error for ${endpoint}:`, error.message);
      throw this.handleError(error);
    }
  }

  async put(endpoint, data) {
    try {
      const response = await this.client.put(endpoint, data);
      return response.data;
    } catch (error) {
      logger.error(`SAP PUT Error for ${endpoint}:`, error.message);
      throw this.handleError(error);
    }
  }

  async delete(endpoint) {
    try {
      const response = await this.client.delete(endpoint);
      return response.data;
    } catch (error) {
      logger.error(`SAP DELETE Error for ${endpoint}:`, error.message);
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.error?.message?.value || error.message,
        data: error.response.data
      };
    } else if (error.request) {
      return {
        status: 503,
        message: 'SAP service unavailable',
        data: null
      };
    } else {
      return {
        status: 500,
        message: error.message,
        data: null
      };
    }
  }
}

module.exports = new SAPClient();