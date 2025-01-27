const express = require('express');
const router = express.Router();
const materialsService = require('../../services/materialsService');
const toolsService = require('../../services/toolsService');

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Fetch all materials
router.get('/materials', asyncHandler(async (req, res) => {
  const materials = await materialsService.getAllMaterials();
  res.json(materials);
}));

// Fetch all tools
router.get('/tools', asyncHandler(async (req, res) => {
  const tools = await toolsService.getAllTools();
  res.json(tools);
}));

// Fetch materials that need reordering
router.get('/materials/reorder-needed', asyncHandler(async (req, res) => {
  const materials = await materialsService.getReorderNeeded();
  res.json(materials);
}));

// Fetch tools that need maintenance
router.get('/tools/maintenance-needed', asyncHandler(async (req, res) => {
  const tools = await toolsService.getToolsRequiringMaintenance();
  res.json(tools);
}));

// Global error handler
router.use((err, req, res, next) => {
  console.error('Inventory Route Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message || 'An unexpected error occurred' 
  });
});

module.exports = router;