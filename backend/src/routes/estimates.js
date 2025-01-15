// src/routes/estimates.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const winston = require('winston');

// Create a logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Get all estimates
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Base query
    let query = `
      SELECT 
        e.*, 
        c.name as client_name
      FROM estimates e
      LEFT JOIN clients c ON e.client_id = c.id
    `;

    const values = [];

    // Add status filter if provided and not empty
    if (status && status.trim() !== '') {
      query += ` WHERE e.status = $1`;
      values.push(status.trim());
    }

    // Add pagination and sorting
    query += ` ORDER BY e.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    // Execute query
    const result = await db.query(query, values);

    // Get total count for pagination
    const countQuery = status && status.trim() !== ''
      ? 'SELECT COUNT(*) FROM estimates WHERE status = $1'
      : 'SELECT COUNT(*) FROM estimates';
    const countValues = status && status.trim() !== '' ? [status.trim()] : [];
    const countResult = await db.query(countQuery, countValues);

    res.json({
      estimates: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(countResult.rows[0].count)
      }
    });
  } catch (error) {
    logger.error('Error fetching estimates', {
      error: error.message,
      stack: error.stack,
      query: req.query
    });

    res.status(500).json({
      error: 'Failed to fetch estimates',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
});

// Get a single estimate by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'SELECT * FROM estimates WHERE id = $1';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching estimate', {
      error: error.message,
      stack: error.stack,
      params: req.params
    });

    res.status(500).json({
      error: 'Failed to fetch estimate',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
});

// Create a new estimate
router.post('/', async (req, res) => {
  try {
    const {
      client_id, status, total_amount, project_location, project_type,
      square_footage, length, width,
      needs_pressure_wash, needs_acid_wash, 
      patch_work_needed, patch_work_gallons,
      minor_crack_gallons, major_crack_gallons,
      fiberglass_mesh_needed, fiberglass_mesh_area,
      cushion_system_needed, cushion_system_area,
      tennis_courts, tennis_court_color,
      pickleball_courts, pickleball_kitchen_color, pickleball_court_color,
      basketball_courts, basketball_court_type, basketball_court_color,
      apron_color,
      permanent_tennis_poles, permanent_pickleball_poles,
      mobile_pickleball_nets,
      low_grade_windscreen, high_grade_windscreen,
      basketball_systems,
      logistics
    } = req.body;

    // Log the incoming request body for debugging
    logger.info('Creating estimate', { 
      method: 'POST', 
      path: '/api/estimates', 
      body: req.body 
    });

    // Insert the estimate into the database
    const query = `
      INSERT INTO estimates (
        client_id, status, total_amount, project_location, project_type,
        square_footage, length, width,
        needs_pressure_wash, needs_acid_wash, 
        patch_work_needed, patch_work_gallons,
        minor_crack_gallons, major_crack_gallons,
        fiberglass_mesh_needed, fiberglass_mesh_area,
        cushion_system_needed, cushion_system_area,
        tennis_courts, tennis_court_color,
        pickleball_courts, pickleball_kitchen_color, pickleball_court_color,
        basketball_courts, basketball_court_type, basketball_court_color,
        apron_color,
        permanent_tennis_poles, permanent_pickleball_poles,
        mobile_pickleball_nets,
        low_grade_windscreen, high_grade_windscreen,
        basketball_systems,
        logistics,
        created_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, 
        $11, $12, 
        $13, $14, 
        $15, $16,
        $17, $18,
        $19, $20,
        $21, $22, $23,
        $24, $25, $26,
        $27,
        $28, $29,
        $30,
        $31, $32,
        $33,
        $34,
        CURRENT_TIMESTAMP
      ) RETURNING *
    `;

    const values = [
      client_id, status, total_amount, project_location, project_type,
      square_footage, length, width,
      needs_pressure_wash, needs_acid_wash, 
      patch_work_needed, patch_work_gallons,
      minor_crack_gallons, major_crack_gallons,
      fiberglass_mesh_needed, fiberglass_mesh_area,
      cushion_system_needed, cushion_system_area,
      tennis_courts, tennis_court_color,
      pickleball_courts, pickleball_kitchen_color, pickleball_court_color,
      basketball_courts, basketball_court_type, basketball_court_color,
      apron_color,
      permanent_tennis_poles, permanent_pickleball_poles,
      mobile_pickleball_nets,
      low_grade_windscreen, high_grade_windscreen,
      JSON.stringify(basketball_systems || []),
      JSON.stringify(logistics || {})
    ];

    const result = await db.query(query, values);

    // Return the newly created estimate
    res.status(201).json(result.rows[0]);
  } catch (error) {
    // Log the full error for server-side debugging
    logger.error('Error creating estimate', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    // Send a user-friendly error response
    res.status(500).json({
      error: 'Failed to create estimate',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
});

// Update an existing estimate
router.put('/:id', async (req, res) => {
  try {
    const estimateId = req.params.id;
    const {
      client_id, status, total_amount, project_location, project_type,
      square_footage, length, width,
      needs_pressure_wash, needs_acid_wash, 
      patch_work_needed, patch_work_gallons,
      minor_crack_gallons, major_crack_gallons,
      fiberglass_mesh_needed, fiberglass_mesh_area,
      cushion_system_needed, cushion_system_area,
      tennis_courts, tennis_court_color,
      pickleball_courts, pickleball_kitchen_color, pickleball_court_color,
      basketball_courts, basketball_court_type, basketball_court_color,
      apron_color,
      permanent_tennis_poles, permanent_pickleball_poles,
      mobile_pickleball_nets,
      low_grade_windscreen, high_grade_windscreen,
      basketball_systems,
      logistics
    } = req.body;

    // Log the incoming request body for debugging
    logger.info('Updating estimate', { 
      method: 'PUT', 
      path: `/api/estimates/${estimateId}`, 
      body: req.body 
    });

    // Update the estimate in the database
    const query = `
      UPDATE estimates SET 
        client_id = $1, 
        status = $2, 
        total_amount = $3, 
        project_location = $4, 
        project_type = $5,
        square_footage = $6, 
        length = $7, 
        width = $8,
        needs_pressure_wash = $9, 
        needs_acid_wash = $10, 
        patch_work_needed = $11, 
        patch_work_gallons = $12,
        minor_crack_gallons = $13, 
        major_crack_gallons = $14,
        fiberglass_mesh_needed = $15, 
        fiberglass_mesh_area = $16,
        cushion_system_needed = $17, 
        cushion_system_area = $18,
        tennis_courts = $19, 
        tennis_court_color = $20,
        pickleball_courts = $21, 
        pickleball_kitchen_color = $22, 
        pickleball_court_color = $23,
        basketball_courts = $24, 
        basketball_court_type = $25, 
        basketball_court_color = $26,
        apron_color = $27,
        permanent_tennis_poles = $28, 
        permanent_pickleball_poles = $29,
        mobile_pickleball_nets = $30,
        low_grade_windscreen = $31, 
        high_grade_windscreen = $32,
        basketball_systems = $33,
        logistics = $34,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $35
      RETURNING *
    `;

    const values = [
      client_id, status, total_amount, project_location, project_type,
      square_footage, length, width,
      needs_pressure_wash, needs_acid_wash, 
      patch_work_needed, patch_work_gallons,
      minor_crack_gallons, major_crack_gallons,
      fiberglass_mesh_needed, fiberglass_mesh_area,
      cushion_system_needed, cushion_system_area,
      tennis_courts, tennis_court_color,
      pickleball_courts, pickleball_kitchen_color, pickleball_court_color,
      basketball_courts, basketball_court_type, basketball_court_color,
      apron_color,
      permanent_tennis_poles, permanent_pickleball_poles,
      mobile_pickleball_nets,
      low_grade_windscreen, high_grade_windscreen,
      JSON.stringify(basketball_systems || []),
      JSON.stringify(logistics || {}),
      estimateId
    ];

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    // Return the updated estimate
    res.json(result.rows[0]);
  } catch (error) {
    // Log the full error for server-side debugging
    logger.error('Error updating estimate', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      params: req.params
    });

    // Send a user-friendly error response
    res.status(500).json({
      error: 'Failed to update estimate',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
});

// Delete an estimate
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM estimates WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    res.json({ 
      message: 'Estimate deleted successfully',
      deletedEstimate: result.rows[0]
    });
  } catch (error) {
    logger.error('Error deleting estimate', {
      error: error.message,
      stack: error.stack,
      params: req.params
    });

    res.status(500).json({
      error: 'Failed to delete estimate',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
});

module.exports = router;