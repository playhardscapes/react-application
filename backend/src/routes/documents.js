// src/routes/documents.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get documents for vendor
router.get('/documents/vendor/:id', async (req, res) => {
  try {
    const query = `
      SELECT * FROM documents
      WHERE entity_type = 'vendor'
      AND entity_id = $1
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [req.params.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

module.exports = router;