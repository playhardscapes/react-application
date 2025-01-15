// src/routes/tasks.js
const express = require('express');
const router = express.Router();
const taskService = require('../services/taskService');
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

// Get all tasks for a project
router.get('/projects/:projectId/tasks', async (req, res) => {
  try {
    const tasks = await taskService.getProjectTasks(req.params.projectId);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get task metrics for a project
router.get('/projects/:projectId/tasks/metrics', async (req, res) => {
  try {
    const metrics = await taskService.getTaskMetrics(req.params.projectId);
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching task metrics:', error);
    res.status(500).json({ error: 'Failed to fetch task metrics' });
  }
});

// Get specific task
router.get('/projects/:projectId/tasks/:taskId', async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create new task
router.post('/projects/:projectId/tasks', 
  validate([
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'completed', 'blocked'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority'),
    body('estimated_hours')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Estimated hours must be positive'),
    body('due_date')
      .optional()
      .isISO8601()
      .withMessage('Invalid due date')
  ]),
  async (req, res) => {
    try {
      const taskData = {
        ...req.body,
        project_id: req.params.projectId
      };

      const task = await taskService.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }
);

// Update task
router.put('/projects/:projectId/tasks/:taskId',
  validate([
    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'completed', 'blocked'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority'),
    body('estimated_hours')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Estimated hours must be positive'),
    body('due_date')
      .optional()
      .isISO8601()
      .withMessage('Invalid due date')
  ]),
  async (req, res) => {
    try {
      const task = await taskService.updateTask(req.params.taskId, req.body);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  }
);

// Delete task
router.delete('/projects/:projectId/tasks/:taskId', async (req, res) => {
  try {
    const result = await taskService.deleteTask(req.params.taskId);
    if (!result.success) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;