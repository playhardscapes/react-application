// src/routes/index.js
const express = require('express');
const winston = require('winston');

// Create a logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Import route modules
const clientRoutes = require('./clients');
const estimateRoutes = require('./estimates');
const vendorRoutes = require('./vendors');
const invoiceRoutes = require('./invoices');
const materialRoutes = require('./materials');
const documentRoutes = require('./documents');
const paymentRoutes = require('./payments');
const notificationRoutes = require('./notifications');
const exportRoutes = require('./export');
const pricingRoutes = require('./pricing');
const mileageRoutes = require('./mileage');
const proposalsRouter = require('./proposals');
const contractsRouter = require('./contracts');
const communicationRoutes = require('./communications');
const emailRoutes = require('./emails');
const projectsRouter = require('../routes/projects');
const tasksRouter = require('../routes/tasks');
const router = express.Router();

const MicrosoftGraphEmailService = require('../services/microsoftGraphService');

try {
  MicrosoftGraphEmailService.startEmailPolling();
  console.log('Email polling started successfully.');
} catch (error) {
  console.error('Failed to start email polling:', error.message);
}



// Logging Middleware
router.use((req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    body: req.body,
    query: req.query
  });
  next();
});

// Mount routes
router.use('/api/estimates', estimateRoutes);
router.use('/api/clients', clientRoutes);
router.use('/api/vendors', vendorRoutes);
router.use('/api/invoices', invoiceRoutes);
router.use('/api/materials', materialRoutes);
router.use('/api/documents', documentRoutes);
router.use('/api/payments', paymentRoutes);
router.use('/api/notifications', notificationRoutes);
router.use('/api/export', exportRoutes);
router.use('/api/mileage', mileageRoutes);
router.use('/api/pricing', pricingRoutes);
router.use('/api/proposals', proposalsRouter);
router.use('/api/contracts', contractsRouter);
router.use('/api/communications', communicationRoutes);
router.use('/api/emails', emailRoutes);
router.use('/api/projects', projectsRouter);
router.use('/api', tasksRouter);  // Tasks routes are nested under projects

// 404 Handler
router.use((req, res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} does not exist`
  });
});

// Global Error Handler
router.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path
  });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: 'Server Error',
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});




module.exports = router;