// src/routes/pricing.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
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
    new winston.transports.File({ filename: 'pricing-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'pricing-combined.log' })
  ]
});

// Get all pricing configurations
router.get('/', async (req, res) => {
  try {
    logger.info('Fetching all pricing configurations');

    const query = `
      SELECT *
      FROM pricing_configurations
      ORDER BY category, name
    `;

    const result = await db.query(query);

    logger.info(`Found ${result.rows.length} pricing configurations`);
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching pricing configurations', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Failed to fetch pricing configurations',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
});

// Get a single pricing configuration by ID
router.get('/:id', async (req, res) => {
  try {
    logger.info(`Fetching pricing configuration with ID: ${req.params.id}`);

    const query = `
      SELECT *
      FROM pricing_configurations
      WHERE id = $1
    `;

    const result = await db.query(query, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pricing configuration not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching pricing configuration', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Failed to fetch pricing configuration',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
});

// Get pricing configurations by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    logger.info(`Fetching pricing configurations for category: ${category}`);

    const query = `
      SELECT *
      FROM pricing_configurations
      WHERE category LIKE $1
      ORDER BY name
    `;

    const result = await db.query(query, [`${category}%`]);
    
    logger.info(`Found ${result.rows.length} pricing configurations for category ${category}`);
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching category pricing configurations', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Failed to fetch category pricing configurations',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
});

// Update pricing configuration
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { value, unit, description } = req.body;
    
    logger.info(`Updating pricing configuration with ID: ${id}`, { value, unit, description });

    const query = `
      UPDATE pricing_configurations 
      SET value = $1, 
          unit = $2,
          description = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;

    const result = await db.query(query, [value, unit, description, id]);

    if (result.rows.length === 0) {
      logger.warn(`No pricing configuration found with ID: ${id}`);
      return res.status(404).json({ error: 'Pricing configuration not found' });
    }

    logger.info(`Successfully updated pricing configuration with ID: ${id}`);
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error updating pricing configuration', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Failed to update pricing configuration',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
});

// Create new pricing configuration
router.post('/', async (req, res) => {
  try {
    const { name, category, value, unit, description } = req.body;
    
    logger.info('Creating new pricing configuration', { name, category, value });

    const query = `
      INSERT INTO pricing_configurations 
      (name, category, value, unit, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await db.query(query, [name, category, value, unit, description]);

    logger.info(`Successfully created new pricing configuration with ID: ${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error creating pricing configuration', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Failed to create pricing configuration',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
});

module.exports = router;