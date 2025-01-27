// src/routes/clients.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const winston = require('winston');
const { auth: authenticateToken } = require('../middleware/auth');

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
router.get('/', authenticateToken, async (req, res) => {
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
router.get('/:id', authenticateToken, async (req, res) => {
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

// Create a new note for a client
router.post('/:id/notes', authenticateToken, async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const { content, note_type = 'internal' } = req.body;

    // Start a transaction
    await client.query('BEGIN');

    // Insert the note
    const result = await client.query(`
      INSERT INTO client_notes (
        client_id,
        content,
        note_type,
        created_by
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      id,
      content,
      note_type,
      req.user?.id || null  // If you have user authentication
    ]);

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating note:', error);
    res.status(500).json({ 
      error: 'Failed to create note',
      details: error.message 
    });
  } finally {
    client.release();
  }
});

// Delete a note
router.delete('/:clientId/notes/:noteId', async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { clientId, noteId } = req.params;

    await client.query('BEGIN');

    const noteCheck = await client.query(
      'SELECT id FROM client_notes WHERE id = $1 AND client_id = $2',
      [noteId, clientId]
    );

    if (noteCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Note not found' });
    }

    await client.query('DELETE FROM client_notes WHERE id = $1', [noteId]);
    await client.query('COMMIT');

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting note:', error);
    res.status(500).json({
      error: 'Failed to delete note',
      details: error.message,
    });
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
// Archive client route
router.put('/:id/archive', async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;

    // Start a transaction
    await client.query('BEGIN');

    // Update the client record
    const clientUpdateResult = await client.query(
      'UPDATE clients SET is_archived = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', 
      [id]
    );

    if (clientUpdateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Client not found' });
    }

    // Update associated follow-ups
    await client.query(
      'UPDATE client_follow_ups SET is_archived = true WHERE client_id = $1', 
      [id]
    );

    // Commit the transaction
    await client.query('COMMIT');

    res.json({ 
      message: 'Client and associated follow-ups archived successfully',
      client: clientUpdateResult.rows[0]
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');

    console.error('Error archiving client:', error);
    res.status(500).json({ 
      error: 'Failed to archive client', 
      details: error.message 
    });
  } finally {
    // Release the client back to the pool
    client.release();
  }
});

// Add this to your clients.js routes file
router.put('/:id/unarchive', async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;

    // Start a transaction
    await client.query('BEGIN');

    // Update the client record
    const clientUpdateResult = await client.query(
      'UPDATE clients SET is_archived = false, archived_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', 
      [id]
    );

    if (clientUpdateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Client not found' });
    }

    // Update associated follow-ups
    await client.query(
      'UPDATE client_follow_ups SET is_archived = false WHERE client_id = $1', 
      [id]
    );

    // Commit the transaction
    await client.query('COMMIT');

    res.json({ 
      message: 'Client and associated follow-ups unarchived successfully',
      client: clientUpdateResult.rows[0]
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');

    console.error('Error unarchiving client:', error);
    res.status(500).json({ 
      error: 'Failed to unarchive client', 
      details: error.message 
    });
  } finally {
    // Release the client back to the pool
    client.release();
  }
});


// Create a new follow-up for a client
router.post('/:id/follow-ups', authenticateToken, async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const { 
      follow_up_date, 
      type, 
      priority = 'medium', 
      notes, 
      status = 'pending' 
    } = req.body;

    // Validate required fields
    if (!follow_up_date || !type || !notes) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await client.query(`
      INSERT INTO client_follow_ups (
        client_id, 
        follow_up_date, 
        type, 
        priority, 
        notes, 
        status
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      id, 
      follow_up_date, 
      type, 
      priority, 
      notes, 
      status
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating follow-up', {
      clientId: req.params.id,
      errorMessage: error.message,
      errorStack: error.stack
    });

    res.status(500).json({ 
      error: 'Failed to create follow-up', 
      details: error.message 
    });
  } finally {
    client.release();
  }
});

router.get('/follow-ups/upcoming', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        fu.*, 
        c.name as client_name 
      FROM client_follow_ups fu
      JOIN clients c ON fu.client_id = c.id
      WHERE 
        fu.status != 'completed' 
        AND fu.is_archived = false
        AND c.is_archived = false
      ORDER BY fu.follow_up_date
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    res.status(500).json({ 
      error: 'Failed to fetch follow-ups', 
      details: error.message 
    });
  }
});

// Complete a specific follow-up
router.patch('/follow-ups/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'completed', completion_notes = '' } = req.body;

    const result = await db.query(`
      UPDATE client_follow_ups 
      SET status = $1, 
          completion_notes = $2, 
          completed_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [status, completion_notes, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Follow-up not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error completing follow-up:', error);
    res.status(500).json({ 
      error: 'Failed to complete follow-up', 
      details: error.message 
    });
  }
});


module.exports = router;