// src/routes/materials.js
const express = require('express');
const router = express.Router();
const materialsService = require('../services/materialsService');  // Update this path

// Get all materials
router.get('/materials', async (req, res) => {
  try {
    const materials = await materialsService.getAllMaterials();
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// Get stock levels
router.get('/materials/stock', async (req, res) => {
  try {
    const stock = await materialsService.getStockByLocation();
    res.json(stock);
  } catch (error) {
    console.error('Error fetching stock levels:', error);
    res.status(500).json({ error: 'Failed to fetch stock levels' });
  }
});

// Get materials that need reordering
router.get('/materials/reorder', async (req, res) => {
  try {
    const materials = await materialsService.getReorderNeeded();
    res.json(materials);
  } catch (error) {
    console.error('Error fetching reorder list:', error);
    res.status(500).json({ error: 'Failed to fetch reorder list' });
  }
});

// Record material receipt
router.post('/materials/receive', async (req, res) => {
  try {
    const transaction = await materialsService.receiveMaterials(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error receiving materials:', error);
    res.status(500).json({ error: 'Failed to receive materials', details: error.message });
  }
});

// Record material usage
router.post('/materials/use', async (req, res) => {
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
router.get('/materials/project/:id', async (req, res) => {
  try {
    const usage = await materialsService.getProjectMaterialUsage(req.params.id);
    res.json(usage);
  } catch (error) {
    console.error('Error fetching project material usage:', error);
    res.status(500).json({ error: 'Failed to fetch project material usage' });
  }
});

module.exports = router;