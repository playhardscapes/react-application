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

// Validate JSON fields and structures
const validateJsonFields = (req, res, next) => {
  const jsonFields = [
    'surface_prep_costs', 
    'coating_costs', 
    'equipment_costs', 
    'logistics_costs', 
    'logistics', 
    'other_items', 
    'basketball_systems'
  ];
  
  for (const field of jsonFields) {
    if (req.body[field]) {
      try {
        // If it's a string, parse it to ensure valid JSON
        if (typeof req.body[field] === 'string') {
          req.body[field] = JSON.parse(req.body[field]);
        }
        // If it's already an object, that's fine
      } catch (error) {
        return res.status(400).json({
          error: `Invalid JSON in ${field} field`,
          details: error.message
        });
      }
    }
  }
  next();
};

// Get estimates
router.get('/', async (req, res) => {
  try {
    const { 
      filter = 'active', 
      page = 1, 
      limit = 50, 
      search = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Base query with client join
    let query = `
      SELECT 
        e.*, 
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone
      FROM estimates e
      LEFT JOIN clients c ON e.client_id = c.id
    `;

    const values = [];
    const conditions = [];

    // Status filtering
    if (filter && filter !== 'all') {
      switch(filter) {
        case 'active':
          conditions.push(`e.status NOT IN ('archived', 'deleted')`);
          break;
        case 'draft':
          conditions.push(`e.status = 'draft'`);
          break;
        case 'completed':
          conditions.push(`e.status = 'completed'`);
          break;
        case 'archived':
          conditions.push(`e.status = 'archived'`);
          break;
        default:
          conditions.push(`e.status = $${values.length + 1}`);
          values.push(filter);
      }
    }

    // Search functionality
    if (search) {
      conditions.push(`(
        c.name ILIKE $${values.length + 1} OR 
        e.project_location ILIKE $${values.length + 1} OR 
        e.project_type ILIKE $${values.length + 1}
      )`);
      values.push(`%${search}%`);
    }

    // Add WHERE clause if conditions exist
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Sorting
    const validSortColumns = [
      'created_at', 'status', 'project_type', 
      'total_amount', 'margin_percentage'
    ];
    const sanitizedSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sanitizedSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) 
      ? sortOrder.toUpperCase() 
      : 'DESC';

    query += ` ORDER BY e.${sanitizedSortBy} ${sanitizedSortOrder}`;

    // Pagination
    query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(Number(limit), offset);

    // Execute query
    const result = await db.query(query, values);

    // Get total count
    const countQuery = query.replace(/SELECT.*?FROM/s, 'SELECT COUNT(*) FROM')
      .replace(/ORDER BY.*LIMIT.*OFFSET.*/, '');
    const countResult = await db.query(countQuery, values.slice(0, -2));

    res.json({
      estimates: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(countResult.rows[0].count)
      }
    });
  } catch (error) {
    logger.error('Error fetching estimates', { error });
    res.status(500).json({ 
      error: 'Failed to fetch estimates',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single estimate
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        e.*,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone
      FROM estimates e
      LEFT JOIN clients c ON e.client_id = c.id
      WHERE e.id = $1
    `;
    
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching estimate', { error });
    res.status(500).json({ 
      error: 'Failed to fetch estimate',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create estimate
router.post('/', validateJsonFields, async (req, res) => {
  try {
    const {
      // Basic Info
      client_id, status, project_location, project_type,
      square_footage, length, width,
      
      // Financial
      margin_percentage,
      total_amount,
      total_with_margin,
      surface_prep_costs,
      coating_costs,
      equipment_costs,
      logistics_costs,
      
      // Surface Prep
      needs_pressure_wash, needs_acid_wash,
      patch_work_gallons, minor_crack_gallons, major_crack_gallons,
      fiberglass_mesh_needed, fiberglass_mesh_area,
      cushion_system_needed, cushion_system_area,
      
      // Courts
      tennis_courts, tennis_court_color,
      pickleball_courts, pickleball_court_color, pickleball_kitchen_color,
      basketball_courts, basketball_court_type, basketball_court_color, basketball_lane_color,
      apron_color,
      
      // Equipment
      permanent_tennis_poles, permanent_pickleball_poles,
      mobile_pickleball_nets,
      low_grade_windscreen, high_grade_windscreen,
      basketball_systems,
      
      // Other
      logistics,
      other_items
    } = req.body;

    const query = `
      INSERT INTO estimates (
        client_id, status, project_location, project_type,
        square_footage, length, width,
        margin_percentage, total_amount, total_with_margin,
        surface_prep_costs, coating_costs, equipment_costs, logistics_costs,
        needs_pressure_wash, needs_acid_wash,
        patch_work_gallons, minor_crack_gallons, major_crack_gallons,
        fiberglass_mesh_needed, fiberglass_mesh_area,
        cushion_system_needed, cushion_system_area,
        tennis_courts, tennis_court_color,
        pickleball_courts, pickleball_court_color, pickleball_kitchen_color,
        basketball_courts, basketball_court_type, basketball_court_color, basketball_lane_color,
        apron_color,
        permanent_tennis_poles, permanent_pickleball_poles,
        mobile_pickleball_nets,
        low_grade_windscreen, high_grade_windscreen,
        basketball_systems,
        logistics, other_items,
        created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
        $41, CURRENT_TIMESTAMP
      ) RETURNING *
    `;

    const values = [
      client_id, status, project_location, project_type,
      square_footage, length, width,
      margin_percentage, total_amount, total_with_margin,
      JSON.stringify(surface_prep_costs || {}), 
      JSON.stringify(coating_costs || {}),
      JSON.stringify(equipment_costs || {}),
      JSON.stringify(logistics_costs || {}),
      needs_pressure_wash, needs_acid_wash,
      patch_work_gallons, minor_crack_gallons, major_crack_gallons,
      fiberglass_mesh_needed, fiberglass_mesh_area,
      cushion_system_needed, cushion_system_area,
      tennis_courts, tennis_court_color,
      pickleball_courts, pickleball_court_color, pickleball_kitchen_color,
      basketball_courts, basketball_court_type, basketball_court_color, basketball_lane_color,
      apron_color,
      permanent_tennis_poles, permanent_pickleball_poles,
      mobile_pickleball_nets,
      low_grade_windscreen, high_grade_windscreen,
      JSON.stringify(basketball_systems || []),
      JSON.stringify(logistics || {}),
      JSON.stringify(other_items || [])
    ];

    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Error creating estimate', { error });
    
    // Handle specific PostgreSQL errors
    if (error.code === '23502') { // not-null violation
      return res.status(400).json({
        error: 'Missing required field',
        details: error.detail
      });
    }
    if (error.code === '23503') { // foreign-key violation
      return res.status(400).json({
        error: 'Invalid client ID',
        details: error.detail
      });
    }
    if (error.code === '23514') { // check violation
      return res.status(400).json({
        error: 'Constraint violation',
        details: error.detail
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create estimate',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update estimate
router.put('/:id', validateJsonFields, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      // Include all fields that can be updated
      status, 
      project_location, 
      margin_percentage,
      total_amount,
      total_with_margin,
      // ... other updateable fields
    } = req.body;

    const query = `
      UPDATE estimates 
      SET 
        status = COALESCE($1, status),
        project_location = COALESCE($2, project_location),
        margin_percentage = COALESCE($3, margin_percentage),
        total_amount = COALESCE($4, total_amount),
        total_with_margin = COALESCE($5, total_with_margin),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;

    const values = [
      status, 
      project_location, 
      margin_percentage,
      total_amount,
      total_with_margin,
      id
    ];

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error updating estimate', { error });
    res.status(500).json({ 
      error: 'Failed to update estimate',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Archive estimate
router.put('/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      UPDATE estimates 
      SET 
        status = 'archived', 
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 AND status = 'completed'
      RETURNING *
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Estimate not found or cannot be archived' 
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error archiving estimate', { error });
    res.status(500).json({ 
      error: 'Failed to archive estimate',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete estimate (only drafts can be deleted)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      DELETE FROM estimates 
      WHERE id = $1 AND status = 'draft' 
      RETURNING *
    `;
    
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Estimate not found or cannot be deleted' 
      });
    }

    res.json({ 
      message: 'Estimate deleted successfully',
      deletedEstimate: result.rows[0]
    });
  } catch (error) {
    logger.error('Error deleting estimate', { error });
    res.status(500).json({ 
      error: 'Failed to delete estimate',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;