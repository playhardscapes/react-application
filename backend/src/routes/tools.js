// src/routes/tools.js
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const toolsService = require('../services/toolsService');
const db = require('../config/database');

// Get all tools
router.get('/', async (req, res) => {
  try {
    const tools = await toolsService.getAllTools();
    res.json(tools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({ error: 'Failed to fetch tools' });
  }
});

// Get single tool details
router.get('/:id', [
  param('id').isInt()
], async (req, res) => {
  try {
    const tool = await toolsService.getToolById(req.params.id);
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    res.json(tool);
  } catch (error) {
    console.error('Error fetching tool:', error);
    res.status(500).json({ error: 'Failed to fetch tool' });
  }
});

// Get tools needing maintenance
router.get('/maintenance-needed', async (req, res) => {
  try {
    console.log('Fetching tools requiring maintenance...');
    const tools = await toolsService.getToolsRequiringMaintenance();
    console.log(`Found ${tools.length} tools needing maintenance`);
    res.json(tools);
  } catch (error) {
    console.error('Error in maintenance-needed route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch maintenance needs', 
      details: {
        message: error.message,
        stack: error.stack
      }
    });
  }
});

// Create new tool
router.post('/', [
  body('name').notEmpty().trim(),
  body('type').notEmpty(),
  body('brand').optional().trim(),
  body('model').optional().trim(),
  body('serialNumber').optional().trim(),
  body('purchaseDate').optional().isISO8601(),
  body('purchasePrice').optional().isFloat({ min: 0 }),
  body('expectedLifetimeMonths').optional().isInt({ min: 1 }),
  body('maintenanceIntervalDays').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const tool = await toolsService.createTool(req.body);
    res.status(201).json(tool);
  } catch (error) {
    console.error('Error creating tool:', error);
    res.status(500).json({ error: 'Failed to create tool' });
  }
});

// Update tool
router.put('/:id', async (req, res) => {
    try {
      const toolId = req.params.id;
      const updateData = req.body;
  
      // Validate required fields
      if (!updateData.name) {
        return res.status(400).json({ 
          error: 'Name is required', 
          details: 'Tool name must be provided' 
        });
      }
  
      const query = `
        UPDATE tools
        SET 
          name = $2,
          type = $3,
          brand = $4,
          model = $5,
          serial_number = $6,
          purchase_date = $7,
          purchase_price = $8,
          expected_lifetime_months = $9,
          maintenance_interval_days = $10,
          status = $11,
          notes = $12,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
  
      const values = [
        toolId,
        updateData.name,
        updateData.type || null,
        updateData.brand || null,
        updateData.model || null,
        updateData.serial_number || null,
        updateData.purchase_date ? new Date(updateData.purchase_date) : null,
        updateData.purchase_price ? parseFloat(updateData.purchase_price) : null,
        updateData.expected_lifetime_months ? parseInt(updateData.expected_lifetime_months) : null,
        updateData.maintenance_interval_days ? parseInt(updateData.maintenance_interval_days) : null,
        updateData.status || 'available',
        updateData.notes || null
      ];
  
      const result = await db.query(query, values);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          error: 'Tool not found',
          details: `No tool found with ID ${toolId}` 
        });
      }
  
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating tool:', error);
      res.status(500).json({ 
        error: 'Failed to update tool', 
        details: error.message 
      });
    }
  });

// Delete tool
router.delete('/:id', [
  param('id').isInt()
], async (req, res) => {
  try {
    const result = await toolsService.deleteTool(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    res.json({ message: 'Tool deleted successfully' });
  } catch (error) {
    console.error('Error deleting tool:', error);
    res.status(500).json({ error: 'Failed to delete tool' });
  }
});

// Check out tool
router.post('/checkout', [
  body('toolId').isInt(),
  body('projectId').isInt(),
  body('userId').isInt(),
  body('expectedReturnDate').isISO8601()
], async (req, res) => {
  try {
    const assignment = await toolsService.checkOutTool(
      req.body.toolId,
      req.body.projectId,
      req.body.userId,
      req.body
    );
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error checking out tool:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check in tool
router.post('/checkin', [
  body('toolId').isInt(),
  body('userId').isInt()
], async (req, res) => {
  try {
    const assignment = await toolsService.checkInTool(
      req.body.toolId,
      req.body.userId,
      req.body
    );
    res.status(200).json(assignment);
  } catch (error) {
    console.error('Error checking in tool:', error);
    res.status(500).json({ error: error.message });
  }
});

// Record tool maintenance
router.post('/maintenance', [
  body('toolId').isInt(),
  body('maintenanceType').isString(),
  body('performedBy').isInt(),
  body('nextMaintenanceDate').isISO8601()
], async (req, res) => {
  try {
    const record = await toolsService.recordMaintenance(
      req.body.toolId,
      req.body
    );
    res.status(201).json(record);
  } catch (error) {
    console.error('Error recording maintenance:', error);
    res.status(500).json({ error: 'Failed to record maintenance' });
  }
});

// Get tool history (maintenance and assignments)
router.get('/:id/history', [
  param('id').isInt()
], async (req, res) => {
  try {
    const history = await toolsService.getToolHistory(req.params.id);
    res.json(history);
  } catch (error) {
    console.error('Error fetching tool history:', error);
    res.status(500).json({ error: 'Failed to fetch tool history' });
  }
});

// Get tool status (current assignment or maintenance)
router.get('/:id/status', [
  param('id').isInt()
], async (req, res) => {
  try {
    const status = await toolsService.getToolStatus(req.params.id);
    res.json(status);
  } catch (error) {
    console.error('Error fetching tool status:', error);
    res.status(500).json({ error: 'Failed to fetch tool status' });
  }
});

// Retire tool
router.post('/:id/retire', [
  param('id').isInt(),
  body('reason').notEmpty().trim(),
  body('effectiveDate').optional().isISO8601()
], async (req, res) => {
  try {
    const tool = await toolsService.retireTool(
      req.params.id,
      req.body.reason,
      req.body.effectiveDate
    );
    res.json(tool);
  } catch (error) {
    console.error('Error retiring tool:', error);
    res.status(500).json({ error: 'Failed to retire tool' });
  }
});

// Schedule maintenance
router.post('/:id/schedule-maintenance', [
  param('id').isInt(),
  body('maintenanceType').notEmpty(),
  body('scheduledDate').isISO8601(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const schedule = await toolsService.scheduleToolMaintenance(
      req.params.id,
      req.body
    );
    res.json(schedule);
  } catch (error) {
    console.error('Error scheduling maintenance:', error);
    res.status(500).json({ error: 'Failed to schedule maintenance' });
  }
});

// Get upcoming maintenance schedule
router.get('/maintenance/upcoming', async (req, res) => {
  try {
    const schedule = await toolsService.getUpcomingMaintenance();
    res.json(schedule);
  } catch (error) {
    console.error('Error fetching maintenance schedule:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance schedule' });
  }
});

// Get tool requirements for a project
router.get('/project/:id/requirements', [
  param('id').isInt()
], async (req, res) => {
  try {
    const requirements = await toolsService.getProjectToolRequirements(req.params.id);
    res.json(requirements);
  } catch (error) {
    console.error('Error fetching project tool requirements:', error);
    res.status(500).json({ error: 'Failed to fetch tool requirements' });
  }
});

// Get tool maintenance history
router.get('/:id/maintenance', [
    param('id').isInt()
  ], async (req, res) => {
    try {
      const maintenanceHistory = await toolsService.getToolMaintenanceHistory(req.params.id);
      res.json(maintenanceHistory);
    } catch (error) {
      console.error('Error fetching tool maintenance history:', error);
      res.status(500).json({ error: 'Failed to fetch maintenance history' });
    }
  });
  
  // Get tool assignment history
  router.get('/:id/assignments', [
    param('id').isInt()
  ], async (req, res) => {
    try {
      const assignmentHistory = await toolsService.getToolAssignmentHistory(req.params.id);
      res.json(assignmentHistory);
    } catch (error) {
      console.error('Error fetching tool assignment history:', error);
      res.status(500).json({ error: 'Failed to fetch assignment history' });
    }
  });
  
  module.exports = router;