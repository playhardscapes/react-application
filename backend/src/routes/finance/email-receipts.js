// src/routes/api/finance/email-receipts.js
const express = require('express');
const router = express.Router();
const emailReceiptService = require('../../services/emailReceiptService');
const { auth: authenticateToken } = require('../../middleware/auth');
const db = require('../../config/database');

router.post('/sync', authenticateToken, async (req, res) => {
  try {
    await emailReceiptService.checkEmailsForReceipts();
    res.json({ message: 'Email receipts synced successfully' });
  } catch (error) {
    console.error('Email sync error:', error);
    res.status(500).json({ error: 'Failed to sync email receipts' });
  }
});

router.get('/config', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT email, processor_type, vendor_id, is_active
      FROM email_receipt_configs
      ORDER BY email
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Config fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch configurations' });
  }
});

router.post('/config', authenticateToken, async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    const { email, processorType, vendorId } = req.body;
    
    const result = await client.query(`
      INSERT INTO email_receipt_configs (email, processor_type, vendor_id, created_by)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) 
      DO UPDATE SET 
        processor_type = EXCLUDED.processor_type,
        vendor_id = EXCLUDED.vendor_id
      RETURNING *
    `, [email, processorType, vendorId, req.user.id]);

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Config update error:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  } finally {
    client.release();
  }
});

router.post('/monitor/start', authenticateToken, async (req, res) => {
  try {
    const { intervalMinutes = 15 } = req.body;
    emailReceiptService.startEmailMonitoring(intervalMinutes);
    res.json({ message: `Email monitoring started (${intervalMinutes} min interval)` });
  } catch (error) {
    console.error('Monitor start error:', error);
    res.status(500).json({ error: 'Failed to start monitoring' });
  }
});

module.exports = router;