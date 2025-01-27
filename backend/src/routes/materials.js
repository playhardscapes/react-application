// src/routes/materials.js
const express = require('express');
const router = express.Router();
const materialsService = require('../services/materialsService');
const db = require('../config/database'); 
const { auth: authenticateToken } = require('../middleware/auth');

// Get all materials
router.get('/', async (req, res) => {
  try {
    const materials = await materialsService.getAllMaterials();
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// Get material locations
router.get('/locations', async (req, res) => {
  try {
    const locations = await materialsService.getMaterialLocations();
    res.json(locations);
  } catch (error) {
    console.error('Error fetching material locations:', error);
    res.status(500).json({ error: 'Failed to fetch material locations' });
  }
});

// Get stock levels
router.get('/stock', async (req, res) => {
  try {
    const stock = await materialsService.getStockByLocation();
    res.json(stock);
  } catch (error) {
    console.error('Error fetching stock levels:', error);
    res.status(500).json({ error: 'Failed to fetch stock levels' });
  }
});

// Get materials that need reordering
router.get('/reorder', async (req, res) => {
  try {
    const materials = await materialsService.getReorderNeeded();
    res.json(materials);
  } catch (error) {
    console.error('Error fetching reorder list:', error);
    res.status(500).json({ error: 'Failed to fetch reorder list' });
  }
});

// Record material receipt
router.post('/receive', async (req, res) => {
  try {
    const transaction = await materialsService.receiveMaterials(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error receiving materials:', error);
    res.status(500).json({ error: 'Failed to receive materials', details: error.message });
  }
});

// Record material usage
router.post('/use', async (req, res) => {
  try {
    const transaction = await materialsService.recordUsage(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error recording material usage:', error);
    res.status(500).json({ 
      error: 'Failed to record material usage',
      message: error.message
    });
  }
});

// Get project material usage
router.get('/project/:id', async (req, res) => {
  try {
    const usage = await materialsService.getProjectMaterialUsage(req.params.id);
    res.json(usage);
  } catch (error) {
    console.error('Error fetching project material usage:', error);
    res.status(500).json({ error: 'Failed to fetch project material usage' });
  }
});

// Get material details by ID
router.get('/:id', async (req, res) => {
  try {
    const materialId = parseInt(req.params.id, 10);
    if (isNaN(materialId)) {
      return res.status(400).json({ error: 'Invalid material ID' });
    }

    const material = await materialsService.getMaterialById(materialId);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(material);
  } catch (error) {
    console.error('Error fetching material details:', error);
    res.status(500).json({ error: 'Failed to fetch material details' });
  }
});

// Get material transactions
router.get('/:id/transactions', async (req, res) => {
  try {
    const materialId = parseInt(req.params.id, 10);
    if (isNaN(materialId)) {
      return res.status(400).json({ error: 'Invalid material ID' });
    }

    const transactions = await materialsService.getMaterialTransactions(materialId);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching material transactions:', error);
    res.status(500).json({ error: 'Failed to fetch material transactions' });
  }
});

// Update material details
router.put('/:id', async (req, res) => {
  try {
    const materialId = req.params.id;
    const updateData = req.body;

    const query = `
      UPDATE materials
      SET 
        name = $2,
        sku = $3,
        category = $4,
        unit = $5,
        unit_size = $6,
        min_quantity = $7,
        reorder_quantity = $8,
        reorder_point = $9,
        ideal_stock_level = $10,
        manufacturer = $11,
        unit_cost = $12,
        notes = $13,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      materialId,
      updateData.name,
      updateData.sku,
      updateData.category,
      updateData.unit,
      updateData.unit_size,
      updateData.min_quantity,
      updateData.reorder_quantity,
      updateData.reorder_point,
      updateData.ideal_stock_level,
      updateData.manufacturer,
      updateData.unit_cost,
      updateData.notes
    ];

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ error: 'Failed to update material', details: error.message });
  }
});

module.exports = router;