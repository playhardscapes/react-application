// src/routes/scheduleRoutes.js
const express = require('express');
const router = express.Router();
const scheduleService = require('../services/scheduleService');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

// Get all schedules
router.get('/projects/schedule', async (req, res) => {
  try {
    const schedules = await scheduleService.getAllSchedules();
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Get schedule by project
router.get('/projects/:projectId/schedule', async (req, res) => {
  try {
    const schedules = await scheduleService.getScheduleByProject(req.params.projectId);
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching project schedule:', error);
    res.status(500).json({ error: 'Failed to fetch project schedule' });
  }
});

// Create new schedule entry
router.post('/projects/:projectId/schedule', validate([
  body('start_date').isISO8601().withMessage('Valid start date is required'),
  body('end_date').isISO8601().withMessage('Valid end date is required'),
  body('schedule_type').isIn(['planned', 'actual']).withMessage('Invalid schedule type'),
  body('status').isIn(['pending', 'in_progress', 'completed', 'delayed'])
    .withMessage('Invalid status'),
  body('weather_dependent').isBoolean().withMessage('Weather dependent must be boolean')
]), async (req, res) => {
  try {
    const scheduleData = {
      project_id: req.params.projectId,
      ...req.body
    };
    const schedule = await scheduleService.createSchedule(scheduleData);
    res.status(201).json(schedule);
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Update schedule status
router.patch('/projects/schedule/:scheduleId/status', validate([
  body('status').isIn(['pending', 'in_progress', 'completed', 'delayed'])
    .withMessage('Invalid status')
]), async (req, res) => {
  try {
    const schedule = await scheduleService.updateScheduleStatus(
      req.params.scheduleId,
      req.body.status
    );
    res.json(schedule);
  } catch (error) {
    console.error('Error updating schedule status:', error);
    res.status(500).json({ error: 'Failed to update schedule status' });
  }
});

// Update schedule entry
router.put('/projects/schedule/:scheduleId', validate([
  body('start_date').optional().isISO8601().withMessage('Invalid start date'),
  body('end_date').optional().isISO8601().withMessage('Invalid end date'),
  body('schedule_type').optional().isIn(['planned', 'actual'])
    .withMessage('Invalid schedule type'),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'delayed'])
    .withMessage('Invalid status'),
  body('weather_dependent').optional().isBoolean()
    .withMessage('Weather dependent must be boolean')
]), async (req, res) => {
  try {
    const schedule = await scheduleService.updateSchedule(
      req.params.scheduleId,
      req.body
    );
    res.json(schedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// Delete schedule entry
router.delete('/projects/schedule/:scheduleId', async (req, res) => {
  try {
    await scheduleService.deleteSchedule(req.params.scheduleId);
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

module.exports = router;