const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
require('dotenv').config();

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const sessionMiddleware = require('./middleware/session');

// Import routes
const loginRoutes = require('./routes/login');
const profileRoutes = require('./routes/profile');
const rfqRoutes = require('./routes/rfq');
const poRoutes = require('./routes/po');
const grRoutes = require('./routes/gr');
const invoiceRoutes = require('./routes/invoice');
const paymentRoutes = require('./routes/payment');
const agingRoutes = require('./routes/aging');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Custom middleware
app.use(sessionMiddleware);

// Routes
app.use('/api/auth', loginRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/rfq', rfqRoutes);
app.use('/api/po', poRoutes);
app.use('/api/gr', grRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/aging', agingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`SAP Vendor Portal Backend running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;