// src/server.js
const express = require('express');
const cors = require('cors');
const proposalRoutes = require('./routes/proposals');
const vendorRoutes = require('./routes/vendors');
const invoiceRoutes = require('./routes/invoices');
const documentRoutes = require('./routes/documents');
const paymentRoutes = require('./routes/payments');
const notificationScheduler = require('./services/notificationScheduler');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', proposalRoutes);
app.use('/api', vendorRoutes);
app.use('/api', invoiceRoutes);
app.use('/api', documentRoutes);
app.use('/api', paymentRoutes);

// Initialize notification scheduler
notificationScheduler.init();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Route error:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack
  });
  res.status(500).json({ error: 'Internal server error' });
});

// Handle 404s for undefined routes
app.use((req, res) => {
  console.log('404 for route:', {
    path: req.path,
    method: req.method
  });
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});