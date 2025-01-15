// src/routes/communications.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const winston = require('winston');

// Get unhandled communications
router.get('/unhandled', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        c.id,
        c.message_content,
        c.type,
        c.received_at,
        cl.name AS client_name,
        cl.email AS client_email,
        cl.phone AS client_phone
      FROM 
        communications c
      JOIN 
        clients cl ON c.client_id = cl.id
      WHERE 
        c.status = 'unhandled'
      ORDER BY 
        c.received_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching unhandled communications:', error);
    res.status(500).json({ error: 'Failed to fetch communications' });
  }
});

// Get count of unhandled communications
router.get('/unhandled/count', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT COUNT(*) as count 
      FROM communications 
      WHERE status = 'unhandled'
    `);
    
    res.json({ 
      count: parseInt(result.rows[0].count, 10) || 0 
    });
  } catch (error) {
    console.error('Error fetching unhandled communications count:', error);
    res.status(500).json({ error: 'Failed to fetch communication count' });
  }
});

// Update communication status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await db.query(`
      UPDATE communications 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Communication not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating communication status:', error);
    res.status(500).json({ error: 'Failed to update communication' });
  }
});

module.exports = router;