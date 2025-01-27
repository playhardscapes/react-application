// src/routes/emails.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');
// In emails.js routes
const MicrosoftGraphService = require('../services/microsoftGraphService');

router.post('/send', auth, async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    const result = await MicrosoftGraphService.sendEmail(to, subject, body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to send email', 
      details: error.message 
    });
  }
});

router.post('/:id/reply', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req.body;
    const result = await MicrosoftGraphService.replyToEmail(id, body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to send reply', 
      details: error.message 
    });
  }
});

router.get('/test-fetch', auth, async (req, res) => {
  try {
    const emails = await MicrosoftGraphService.fetchEmails();
    res.json({ success: true, emails });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
    try {
      const { 
        folder = 'inbox', 
        page = 1, 
        limit = 20, 
        search = '', 
        category 
      } = req.query;
  
      console.log('Received Email Query Parameters:', {
        folder, 
        page, 
        limit, 
        search, 
        category
      });
  
      // Convert to numbers
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const offset = (pageNum - 1) * limitNum;
  
      let query = `
  SELECT 
    id, 
    sender_email, 
    sender_name, 
    subject, 
    received_at, 
    status, 
    category,
    body,
    html_body,
    recipient_email
  FROM emails
  WHERE 1=1
`;
  
      const queryParams = [];
      let paramCount = 1;
  
      // Add folder-based status filter
      switch(folder) {
        case 'inbox':
          query += ` AND status = 'unread'`;
          break;
        case 'sent':
          query += ` AND status = 'sent'`;
          break;
        case 'archived':
          query += ` AND status = 'archived'`;
          break;
        case 'trashed':
          query += ` AND status = 'deleted'`;
          break;
      }
  
      // Category filter
      if (category) {
        query += ` AND category = $${paramCount}`;
        queryParams.push(category);
        paramCount++;
      }
  
      // Search filter
      if (search) {
        query += ` AND (
          sender_name ILIKE $${paramCount} OR 
          sender_email ILIKE $${paramCount} OR 
          subject ILIKE $${paramCount}
        )`;
        queryParams.push(`%${search}%`);
        paramCount++;
      }
  
      // Add ordering and pagination
      query += ` 
        ORDER BY received_at DESC 
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;
      
      queryParams.push(limitNum, offset);
  
      console.log('Executing Query:', {
        query,
        params: queryParams
      });
  
      // Execute query
      const result = await db.query(query, queryParams);
  
      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) 
        FROM emails
        WHERE 1=1
        ${folder === 'inbox' ? "AND status NOT IN ('archived', 'deleted')" : 
          folder === 'archived' ? "AND status = 'archived'" : 
          folder === 'deleted' ? "AND status = 'deleted'" : ''}
        ${category ? `AND category = $1` : ''}
        ${search ? `AND (
          sender_name ILIKE $${category ? 2 : 1} OR 
          sender_email ILIKE $${category ? 2 : 1} OR 
          subject ILIKE $${category ? 2 : 1}
        )` : ''}
      `;
  
      const countParams = [];
      if (category) countParams.push(category);
      if (search) countParams.push(`%${search}%`);
  
      console.log('Executing Count Query:', {
        query: countQuery,
        params: countParams
      });
  
      const countResult = await db.query(countQuery, countParams);
  
      console.log('Query Results:', {
        emails: result.rows,
        total: parseInt(countResult.rows[0].count),
        page: pageNum,
        limit: limitNum
      });
  
      res.json({
        emails: result.rows,
        total: parseInt(countResult.rows[0].count),
        page: pageNum,
        limit: limitNum
      });
    } catch (error) {
        console.error('Detailed Email Fetch Error:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
          query: query,
          params: queryParams
        });
    
        res.status(500).json({
          error: 'Failed to fetch emails',
          details: {
            message: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
          }
        });
      }
    });

// Add other email-related routes here (e.g., send, reply, etc.)

module.exports = router;