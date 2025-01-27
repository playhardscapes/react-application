// src/routes/inventory/locations.js
const express = require('express');
const router = express.Router();
const { auth: authenticateToken } = require('../../middleware/auth')
const { body, param } = require('express-validator');
const locationsService = require('../../services/locationsService');


// Error handling middleware
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all active locations
router.get('/', asyncHandler(async (req, res) => {
  const locations = await locationsService.getAllLocations();
  res.json(locations);
}));

// Get all archived locations
router.get('/archived', asyncHandler(async (req, res) => {
  const locations = await locationsService.getArchivedLocations();
  res.json(locations);
}));

// Create new location
router.post('/', [
  body('name').trim().notEmpty().withMessage('Location name is required'),
  body('type').optional().isIn(['storage', 'job_site', 'in_transit']),
  body('address').optional().trim()
], asyncHandler(async (req, res) => {
  const location = await locationsService.createLocation(req.body);
  res.status(201).json(location);
}));

// Get location by ID
router.get('/:id', [
  param('id').isInt()
], asyncHandler(async (req, res) => {
  const location = await locationsService.getLocationById(req.params.id);
  if (!location) {
    return res.status(404).json({ error: 'Location not found' });
  }
  res.json(location);
}));

// Archive a location
router.post('/:id/archive', [
  param('id').isInt()
], asyncHandler(async (req, res) => {
  const location = await locationsService.archiveLocation(req.params.id);
  if (!location) {
    return res.status(404).json({ error: 'Location not found' });
  }
  res.json(location);
}));

// Restore an archived location
router.post('/:id/restore', [
  param('id').isInt()
], asyncHandler(async (req, res) => {
  const location = await locationsService.restoreLocation(req.params.id);
  if (!location) {
    return res.status(404).json({ error: 'Location not found' });
  }
  res.json(location);
}));

// Update a location
router.put('/:id', [
  param('id').isInt(),
  body('name').trim().notEmpty().withMessage('Location name is required'),
  body('type').optional().isIn(['storage', 'job_site', 'in_transit']),
  body('address').optional().trim()
], asyncHandler(async (req, res) => {
  const location = await locationsService.updateLocation(req.params.id, req.body);
  if (!location) {
    return res.status(404).json({ error: 'Location not found' });
  }
  res.json(location);
}));

module.exports = router;