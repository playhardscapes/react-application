// src/routes/inventory.js
const express = require('express');
const router = express.Router();
const inventoryService = require('../services/inventoryService');
const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
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

// Add new material
router.post('/materials',
  validate([
    body('name').notEmpty().trim().withMessage('Material name is required'),
    body('sku').optional().trim(),
    body('category').notEmpty().withMessage('Category is required'),
    body('unit').notEmpty().withMessage('Unit is required'),
    body('unit_size').isFloat({ min: 0 }).withMessage('Valid unit size required'),
    body('min_quantity').isFloat({ min: 0 }).withMessage('Valid minimum quantity required'),
    body('reorder_quantity').isFloat({ min: 0 }).withMessage('Valid reorder quantity required')
  ]),
  async (req, res) => {
    try {
      const material = await inventoryService.addMaterial(req.body);
      res.status(201).json(material);
    } catch (error) {
      console.error('Material creation error:', error);
      res.status(500).json({ error: 'Failed to create material' });
    }
});

// Record inventory transaction
router.post('/transactions',
  validate([
    body('material_id').isInt().withMessage('Valid material ID required'),
    body('location_id').isInt().withMessage('Valid location ID required'),
    body('transaction_type').isIn(['receive',