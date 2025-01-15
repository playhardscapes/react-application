// src/routes/clients.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const winston = require('winston');

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

// Get all clients
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        c.*,
        COUNT(DISTINCT p.id) as total_projects
      FROM clients c
      LEFT JOIN projects p ON c.id = p.client_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    
    res.json({ clients: result.rows });
  } catch (error) {
    logger.error('Error fetching clients:', {
      error: error.message,
      stack: error.stack,
      details: error
    });
    res.status(500).json({ error: 'Failed to fetch clients', details: error.message });
  }
});

// Get client by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info(`Fetching client with ID: ${id}`);

    const result = await db.query(`
      SELECT 
        c.*,
        COUNT(DISTINCT p.id) as total_projects,
        (
          SELECT json_agg(
            json_build_object(
              'id', p.id,
              'title', p.title,
              'status', p.status,
              'location', p.location,
              'start_date', p.start_date,
              'completion_date', p.completion_date,
              'updated_at', p.updated_at
            )
          )
          FROM projects p 
          WHERE p.client_id = c.id
        ) as projects,
        (
          SELECT json_agg(
            json_build_object(
              'id', f.id,
              'follow_up_date', f.follow_up_date,
              'notes', f.notes,
              'status', f.status
            )
          )
          FROM client_follow_ups f 
          WHERE f.client_id = c.id
        ) as follow_ups,
        (
          SELECT json_agg(
            json_build_object(
              'id', n.id,
              'content', n.content,
              'created_at', n.created_at
            )
          )
          FROM client_notes n 
          WHERE n.client_id = c.id
        ) as notes
      FROM clients c
      LEFT JOIN projects p ON c.id = p.client_id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);

    if (result.rows.length === 0) {
      logger.warn(`No client found with ID: ${id}`);
      return res.status(404).json({ error: 'Client not found' });
    }

    logger.info(`Successfully fetched client with ID: ${id}`);
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Detailed error fetching client:', {
      errorMessage: error.message,
      errorStack: error.stack,
      clientId: req.params.id
    });
    res.status(500).json({ 
      error: 'Failed to fetch client', 
      details: error.message 
    });
  }
});

// Create client
router.post('/', async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      organization,
      type,
      preferred_contact_method,
      source,
      initial_follow_up
    } = req.body;

    const result = await client.query(`
      INSERT INTO clients (
        name, email, phone, address, city,
        state, organization, type,
        preferred_contact_method, source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      name, email, phone, address, city,
      state, organization, type,
      preferred_contact_method, source
    ]);

    if (initial_follow_up) {
      await client.query(`
        INSERT INTO client_follow_ups (
          client_id, follow_up_date, notes,
          status, type
        ) VALUES ($1, $2, $3, 'pending', 'initial_contact')
      `, [
        result.rows[0].id,
        initial_follow_up.date,
        initial_follow_up.notes
      ]);
    }

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  } finally {
    client.release();
  }
});

// Update client
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Log incoming update request
    logger.info(`Attempting to update client with ID: ${id}`, { 
      updates: Object.keys(updates) 
    });

    const fields = [];
    const values = [id];
    let paramCount = 2;

    // Filter out problematic fields
    const allowedFields = [
      'name', 'email', 'phone', 'address', 'city', 
      'state', 'zip', 'organization', 'type', 
      'preferred_contact_method', 'source'
    ];

    Object.keys(updates).forEach(key => {
      // Only allow specific fields to be updated
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    // Ensure there are fields to update
    if (fields.length === 0) {
      return res.status(400).json({ 
        error: 'No valid fields to update',
        allowedFields: allowedFields
      });
    }

    const query = `
      UPDATE clients
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    // Log the constructed query (without values for security)
    logger.info(`Update query constructed for client ${id}`, { 
      queryFields: fields 
    });

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      logger.warn(`No client found with ID: ${id}`);
      return res.status(404).json({ error: 'Client not found' });
    }

    logger.info(`Successfully updated client with ID: ${id}`);
    res.json(result.rows[0]);
  } catch (error) {
    // Detailed error logging
    logger.error('Error updating client', {
      clientId: id,
      errorMessage: error.message,
      errorStack: error.stack,
      updates: Object.keys(updates)
    });

    // Determine appropriate error response
    if (error.code === '23505') {
      // Unique constraint violation (e.g., duplicate email)
      res.status(409).json({ 
        error: 'Update failed', 
        details: 'Duplicate entry (possibly email) already exists' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to update client', 
        details: error.message 
      });
    }
  }
});

module.exports = router;