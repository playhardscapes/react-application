// src/controllers/pricingController.js
const db = require('../config/database');

const pricingController = {
  /**
   * Get all pricing configurations
   */
  async getAllPricing(req, res) {
    try {
      const result = await db.query(
        'SELECT * FROM pricing_configurations ORDER BY category, name'
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching pricing:', error);
      res.status(500).json({ error: 'Failed to fetch pricing configurations' });
    }
  },

  /**
   * Get pricing configurations by category
   */
  async getPricingByCategory(req, res) {
    const { category } = req.params;
    try {
      const result = await db.query(
        'SELECT * FROM pricing_configurations WHERE category LIKE $1 ORDER BY name',
        [`${category}%`]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching category pricing:', error);
      res.status(500).json({ error: 'Failed to fetch category pricing' });
    }
  },

  /**
   * Update pricing configuration
   */
  async updatePricing(req, res) {
    const { id } = req.params;
    const { value, unit, description } = req.body;

    try {
      const result = await db.query(
        `UPDATE pricing_configurations 
         SET value = $1, 
             unit = $2,
             description = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [value, unit, description, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Pricing configuration not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating pricing:', error);
      res.status(500).json({ error: 'Failed to update pricing configuration' });
    }
  },

  /**
   * Create new pricing configuration
   */
  async createPricing(req, res) {
    const { name, category, value, unit, description } = req.body;

    try {
      const result = await db.query(
        `INSERT INTO pricing_configurations 
         (name, category, value, unit, description)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [name, category, value, unit, description]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating pricing:', error);
      res.status(500).json({ error: 'Failed to create pricing configuration' });
    }
  }
};

module.exports = pricingController;