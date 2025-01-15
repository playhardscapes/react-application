// src/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    return res.status(400).json({ 
      error: 'Validation Failed', 
      details: errors.array() 
    });
  };
};

// Validation rules for estimates
const estimateValidationRules = {
  create: [
    body('client_name').trim().notEmpty().withMessage('Client name is required'),
    body('client_email').optional().isEmail().withMessage('Invalid email format'),
    body('length').isFloat({ min: 0 }).withMessage('Length must be a positive number'),
    body('width').isFloat({ min: 0 }).withMessage('Width must be a positive number'),
    body('status').optional().isIn(['draft', 'active', 'completed']).withMessage('Invalid status')
  ],
  
  update: [
    param('id').isInt().withMessage('Invalid estimate ID'),
    body('client_name').optional().trim().notEmpty().withMessage('Client name cannot be empty'),
    body('client_email').optional().isEmail().withMessage('Invalid email format')
  ]
};

// Validation rules for vendors
const vendorValidationRules = {
  create: [
    body('name').trim().notEmpty().withMessage('Vendor name is required'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('payment_terms').optional().isIn(['net15', 'net30', 'net45', 'net60']).withMessage('Invalid payment terms')
  ],
  
  update: [
    param('id').isInt().withMessage('Invalid vendor ID'),
    body('name').optional().trim().notEmpty().withMessage('Vendor name cannot be empty'),
    body('email').optional().isEmail().withMessage('Invalid email format')
  ]
};

// Validation rules for invoices
const invoiceValidationRules = {
  create: [
    body('vendor_id').isInt().withMessage('Vendor ID is required'),
    body('invoice_number').trim().notEmpty().withMessage('Invoice number is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('issue_date').isDate().withMessage('Invalid issue date'),
    body('due_date').isDate().withMessage('Invalid due date')
  ],
  
  update: [
    param('id').isInt().withMessage('Invalid invoice ID'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number')
  ]
};

// Pagination validation
const paginationValidationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

module.exports = {
  validate,
  estimateValidationRules,
  vendorValidationRules,
  invoiceValidationRules,
  paginationValidationRules
};