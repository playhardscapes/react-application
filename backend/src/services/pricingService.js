// src/services/pricingService.js
const db = require('../config/database');
const {
  MATERIALS_PRICING,
  SERVICES_PRICING,
  EQUIPMENT_PRICING
} = require('../constants/pricing');
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
    new winston.transports.File({ filename: 'pricing-service-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'pricing-service-combined.log' })
  ]
});

const pricingService = {
  /**
   * Get all pricing configurations
   * @param {Object} user User context for logging
   * @returns {Promise<Array>} List of pricing configurations
   */
  async getAllPricingConfigurations(user) {
    try {
      logger.info('Fetching all pricing configurations', { 
        userId: user.id, 
        userEmail: user.email 
      });

      const query = `
        SELECT *
        FROM pricing_configurations
        ORDER BY category, name
      `;
      const result = await db.query(query);
      
      logger.info(`Retrieved ${result.rows.length} pricing configurations`);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching pricing configurations', {
        error: error.message,
        userId: user.id
      });
      throw error;
    }
  },

  /**
   * Get a specific pricing configuration by ID
   * @param {number} id Pricing configuration ID
   * @param {Object} user User context for logging
   * @returns {Promise<Object>} Pricing configuration
   */
  async getPricingConfigurationById(id, user) {
    try {
      logger.info(`Fetching pricing configuration by ID: ${id}`, { 
        userId: user.id 
      });

      const query = `
        SELECT *
        FROM pricing_configurations
        WHERE id = $1
      `;
      const result = await db.query(query, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching pricing configuration by ID', {
        error: error.message,
        userId: user.id,
        configId: id
      });
      throw error;
    }
  },

  /**
   * Create a new pricing configuration
   * @param {Object} configData Pricing configuration details
   * @param {Object} user User context for logging
   * @returns {Promise<Object>} Created pricing configuration
   */
  async createPricingConfiguration(configData, user) {
    try {
      logger.info('Creating new pricing configuration', { 
        userId: user.id,
        name: configData.name,
        category: configData.category
      });

      const query = `
        INSERT INTO pricing_configurations (
          name,
          category,
          value,
          unit,
          description,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      const values = [
        configData.name,
        configData.category,
        configData.value,
        configData.unit || null,
        configData.description || null
      ];

      const result = await db.query(query, values);
      
      logger.info(`Created pricing configuration with ID: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating pricing configuration', {
        error: error.message,
        userId: user.id
      });
      throw error;
    }
  },

  /**
   * Update an existing pricing configuration
   * @param {number} id Configuration ID
   * @param {Object} configData Updated configuration details
   * @param {Object} user User context for logging
   * @returns {Promise<Object>} Updated pricing configuration
   */
  async updatePricingConfiguration(id, configData, user) {
    try {
      logger.info(`Updating pricing configuration with ID: ${id}`, { 
        userId: user.id,
        updates: Object.keys(configData)
      });

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

      const values = [
        configData.name,
        configData.category,
        configData.value,
        configData.unit,
        configData.description,
        id
      ];

      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        logger.warn(`No pricing configuration found with ID: ${id}`);
        throw new Error('Pricing configuration not found');
      }

      logger.info(`Successfully updated pricing configuration with ID: ${id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating pricing configuration', {
        error: error.message,
        userId: user.id,
        configId: id
      });
      throw error;
    }
  },

  /**
   * Delete a pricing configuration
   * @param {number} id Configuration ID
   * @param {Object} user User context for logging
   * @returns {Promise<Object>} Deleted pricing configuration
   */
  async deletePricingConfiguration(id, user) {
    try {
      logger.info(`Deleting pricing configuration with ID: ${id}`, { 
        userId: user.id 
      });

      const query = `
        DELETE FROM pricing_configurations
        WHERE id = $1
        RETURNING *
      `;

      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        logger.warn(`No pricing configuration found with ID: ${id}`);
        throw new Error('Pricing configuration not found');
      }

      logger.info(`Successfully deleted pricing configuration with ID: ${id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error deleting pricing configuration', {
        error: error.message,
        userId: user.id,
        configId: id
      });
      throw error;
    }
  },

  /**
   * Get pricing configurations by category
   * @param {string} category Category to filter
   * @param {Object} user User context for logging
   * @returns {Promise<Array>} Pricing configurations in the category
   */
  async getPricingByCategory(category, user) {
    try {
      logger.info(`Fetching pricing configurations for category: ${category}`, { 
        userId: user.id 
      });

      const query = `
        SELECT *
        FROM pricing_configurations
        WHERE category LIKE $1
        ORDER BY name
      `;

      const result = await db.query(query, [`${category}%`]);
      
      logger.info(`Found ${result.rows.length} pricing configurations for category ${category}`);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching category pricing configurations', {
        error: error.message,
        userId: user.id,
        category
      });
      throw error;
    }
  }
};

module.exports = pricingService;