const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { auth: authenticateToken } = require('../../middleware/auth');

router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const pendingExpensesResult = await db.query(`
      SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
      FROM finance_transactions
      WHERE status = 'pending'
    `);

    const unreconciledResult = await db.query(`
      SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
      FROM bank_transactions
      WHERE status = 'pending'
    `);

    const cashBalanceResult = await db.query(`
        SELECT COALESCE(SUM(
          CASE WHEN category = 'income' THEN amount 
               WHEN category = 'expense' THEN -amount 
               ELSE 0 
          END
        ), 0) as balance
        FROM finance_transactions
      `);

    res.json({
      pendingExpenses: pendingExpensesResult.rows[0].count,
      unreconciled: unreconciledResult.rows[0].count,
      cashBalance: cashBalanceResult.rows[0].balance
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

module.exports = router;