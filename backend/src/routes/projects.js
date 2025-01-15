// src/routes/projects.js
const express = require('express');
const router = express.Router();
const projectService = require('../services/projectService');
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

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await projectService.getAllProjects();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project
router.post('/', validate([
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('client_id').isInt().withMessage('Valid client ID is required'),
  body('contract_id').isInt().optional().withMessage('Invalid contract ID'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('complexity')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid complexity'),
  body('estimated_hours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated hours must be positive'),
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date'),
  body('completion_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid completion date')
]), async (req, res) => {
  try {
    const project = await projectService.createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', validate([
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('complexity')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid complexity'),
  body('estimated_hours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated hours must be positive'),
  body('actual_hours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual hours must be positive'),
]), async (req, res) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Update project hours
router.put('/:id/hours', validate([
  body('hours')
    .isFloat({ min: 0.1 })
    .withMessage('Hours must be greater than 0')
]), async (req, res) => {
  try {
    const project = await projectService.updateProjectHours(
      req.params.id, 
      req.body.hours
    );
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error updating project hours:', error);
    res.status(500).json({ error: 'Failed to update project hours' });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const result = await projectService.deleteProject(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;