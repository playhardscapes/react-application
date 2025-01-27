// src/routes/pricing.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const winston = require('winston');
const { auth: authenticateToken } = require('../middleware/auth');
const checkPermission = require('../middleware/permissionMiddleware');

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
router.get('/', 
  authenticateToken,
  checkPermission('pricing', 'view'),
  async (req, res) => {
    try {
      logger.info('Fetching all pricing configurations', { 
        userId: req.user.id, 
        userEmail: req.user.email 
      });

      const query = `
        SELECT 
          id, 
          name, 
          category, 
          value, 
          unit, 
          description,
          created_at,
          updated_at
        FROM pricing_configurations
        ORDER BY category, name
      `;

      const result = await db.query(query);

      if (result.rows.length === 0) {
        logger.warn('No pricing configurations found', { userId: req.user.id });
        return res.status(200).json({ 
          message: 'No pricing configurations available',
          data: [] 
        });
      }

      logger.info(`Found ${result.rows.length} pricing configurations`);
      res.json(result.rows);

    } catch (error) {
      logger.error('Error fetching pricing configurations', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      });

      res.status(500).json({
        error: 'Failed to fetch pricing configurations',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      });
    }
  }
);

// Get a single pricing configuration by ID
router.get('/:id', 
  authenticateToken,
  checkPermission('pricing', 'view'),
  async (req, res) => {
    try {
      logger.info(`Fetching pricing configuration with ID: ${req.params.id}`, {
        userId: req.user.id
      });

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
        stack: error.stack,
        userId: req.user?.id
      });

      res.status(500).json({
        error: 'Failed to fetch pricing configuration',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      });
    }
  }
);

// Get pricing configurations by category
router.get('/category/:category', 
  authenticateToken,
  checkPermission('pricing', 'view'),
  async (req, res) => {
    try {
      const { category } = req.params;
      logger.info(`Fetching pricing configurations for category: ${category}`, {
        userId: req.user.id
      });

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
        stack: error.stack,
        userId: req.user?.id
      });

      res.status(500).json({
        error: 'Failed to fetch category pricing configurations',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      });
    }
  }
);

// Update pricing configuration
router.put('/:id', 
  authenticateToken,
  checkPermission('pricing', 'update'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, category, value, unit, description } = req.body;
      
      logger.info(`Updating pricing configuration with ID: ${id}`, { 
        userId: req.user.id,
        name, 
        category, 
        value, 
        unit, 
        description 
      });

      // Check if the new name/category combination would conflict
      if (name && category) {
        const checkQuery = `
          SELECT id FROM pricing_configurations 
          WHERE name = $1 AND category = $2 AND id != $3
        `;
        const checkResult = await db.query(checkQuery, [name, category, id]);
        if (checkResult.rows.length > 0) {
          return res.status(409).json({ 
            error: 'A pricing configuration with this name and category already exists' 
          });
        }
      }

      const query = `
        UPDATE pricing_configurations 
        SET name = COALESCE($1, name),
            category = COALESCE($2, category),
            value = COALESCE($3, value), 
            unit = COALESCE($4, unit),
            description = COALESCE($5, description),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
      `;

      const result = await db.query(query, [name, category, value, unit, description, id]);

      if (result.rows.length === 0) {
        logger.warn(`No pricing configuration found with ID: ${id}`);
        return res.status(404).json({ error: 'Pricing configuration not found' });
      }

      logger.info(`Successfully updated pricing configuration with ID: ${id}`);
      res.json(result.rows[0]);
    } catch (error) {
      logger.error('Error updating pricing configuration', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      });

      res.status(500).json({
        error: 'Failed to update pricing configuration',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      });
    }
  }
);

// Create new pricing configuration
router.post('/', 
  authenticateToken,
  checkPermission('pricing', 'create'),
  async (req, res) => {
    try {
      const { name, category, value, unit, description } = req.body;
      
      // Validate required fields
      if (!name || !category || value === undefined) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          details: { name, category, value }
        });
      }

      // Check for duplicate configuration
      const duplicateCheck = await db.query(`
        SELECT id FROM pricing_configurations 
        WHERE name = $1 AND category = $2
      `, [name, category]);

      if (duplicateCheck.rows.length > 0) {
        return res.status(409).json({ 
          error: 'A pricing configuration with this name and category already exists' 
        });
      }

      const query = `
        INSERT INTO pricing_configurations 
        (name, category, value, unit, description, created_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const result = await db.query(query, [
        name, 
        category, 
        value, 
        unit || null, 
        description || null
      ]);

      logger.info(`Successfully created new pricing configuration with ID: ${result.rows[0].id}`, {
        userId: req.user.id,
        name,
        category
      });

      res.status(201).json(result.rows[0]);
    } catch (error) {
      logger.error('Error creating pricing configuration', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        requestBody: req.body
      });

      res.status(500).json({
        error: 'Failed to create pricing configuration',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      });
    }
  }
);

// Delete pricing configuration
router.delete('/:id', 
  authenticateToken,
  checkPermission('pricing', 'delete'),
  async (req, res) => {
    try {
      const { id } = req.params;

      logger.info(`Attempting to delete pricing configuration with ID: ${id}`, {
        userId: req.user.id
      });

      const query = `
        DELETE FROM pricing_configurations
        WHERE id = $1
        RETURNING *
      `;

      const result = await db.query(query, [id]);

      if (result.rows.length === 0) {
        logger.warn(`No pricing configuration found with ID: ${id}`);
        return res.status(404).json({ error: 'Pricing configuration not found' });
      }

      logger.info(`Successfully deleted pricing configuration with ID: ${id}`);
      res.json({ 
        message: 'Pricing configuration deleted successfully',
        deletedConfiguration: result.rows[0]
      });
    } catch (error) {
      logger.error('Error deleting pricing configuration', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      });

      res.status(500).json({
        error: 'Failed to delete pricing configuration',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      });
    }
  }
);

module.exports = router;