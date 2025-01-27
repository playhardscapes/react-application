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
const authRoutes = require('./auth');
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
const aiRouter = require('./ai');
const router = express.Router();
const inventoryRouter = require('./inventory');
const locationRouter = require('./inventory/locations');  // Corrected import path
const toolsRouter = require('./tools');
const aiConfigRouter = require('./aiConfig')
const schedulingRouter = require('./scheduling');
const MicrosoftGraphEmailService = require('../services/microsoftGraphService');
const usersRouter = require('./users');
const ocrRouter = require('./ocr');
const ordersRouter = require('./inventory/orders');
const financeTransactions = require('./finance/transactions');
const financeReconciliation = require('./finance/reconciliation');
const financeDocuments = require('./finance/documents');
const emailReceipts = require('./finance/email-receipts');
const financeDashboardRoutes = require('./finance/dashboard');
const { auth: authenticateToken } = require('../middleware/auth');
const cardsRouter = require('./finance/cards');
const expensesRouter = require('./finance/expenses');

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
router.use('/api/auth', authRoutes);
router.use('/api', authenticateToken);

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
router.use('/api/ai', aiRouter);  // AI development partner routes
router.use('/api/inventory', inventoryRouter);
router.use('/api/tools', toolsRouter);
router.use('/api/ai-config', aiConfigRouter);
router.use('/api/projects', schedulingRouter);
router.use('/api/users', usersRouter);
router.use('/api/ocr', ocrRouter);
router.use('/api/inventory/locations', locationRouter);  // Keep this route as is
router.use('/api/inventory/orders', ordersRouter);
router.use('/api/finance/transactions', financeTransactions);
router.use('/api/finance/reconciliation', financeReconciliation);
router.use('/api/finance/documents', financeDocuments);
router.use('/api/finance/email-receipts', emailReceipts);
router.use('/api/finance/dashboard', financeDashboardRoutes);
router.use('/api/finance/cards', cardsRouter);

router.use('/api/finance/expenses', expensesRouter);

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