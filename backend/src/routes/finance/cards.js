// src/routes/finance/cards.js
const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { auth: authenticateToken } = require('../../middleware/auth');

router.get('/unreconciled', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) as unreconciled,
        COALESCE(SUM(amount), 0) as total_amount
      FROM bank_transactions
      WHERE status = 'pending'
      AND account_type = 'credit_card'
      AND finance_transaction_id IS NULL
    `);

    res.json({
      unreconciled: parseInt(result.rows[0].unreconciled),
      totalAmount: parseFloat(result.rows[0].total_amount)
    });
  } catch (error) {
    console.error('Error fetching unreconciled cards:', error);
    res.status(500).json({ error: 'Failed to fetch card activity' });
  }
});

module.exports = router;