// src/routes/inventory/materials.js
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const materialsService = require('../../services/materialsService');

// Get all materials with stock levels
router.get('/', async (req, res) => {
  try {
    const materials = await materialsService.getAllMaterials();
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// Get material stock by location
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
router.get('/reorder-needed', async (req, res) => {
  try {
    const materials = await materialsService.getReorderNeeded();
    res.json(materials);
  } catch (error) {
    console.error('Error fetching reorder list:', error);
    res.status(500).json({ error: 'Failed to fetch reorder list' });
  }
});

// Receive materials into inventory
router.post('/receive', [
  body('materialId').isInt(),
  body('quantity').isFloat({ min: 0.01 }),
  body('locationId').isInt(),
  body('vendorId').isInt(),
  body('unitPrice').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const transaction = await materialsService.receiveMaterials(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error receiving materials:', error);
    res.status(500).json({ error: 'Failed to receive materials' });
  }
});

// Record material usage
router.post('/use', [
  body('materialId').isInt(),
  body('quantity').isFloat({ min: 0.01 }),
  body('locationId').isInt(),
  body('projectId').isInt()
], async (req, res) => {
  try {
    const transaction = await materialsService.recordUsage(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error recording material usage:', error);
    res.status(500).json({ error: 'Failed to record usage' });
  }
});

// Get material usage history by project
router.get('/project/:id/usage', [
  param('id').isInt()
], async (req, res) => {
  try {
    const usage = await materialsService.getProjectMaterialUsage(req.params.id);
    res.json(usage);
  } catch (error) {
    console.error('Error fetching project material usage:', error);
    res.status(500).json({ error: 'Failed to fetch usage history' });
  }
});

module.exports = router;