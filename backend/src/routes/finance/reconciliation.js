// src/routes/api/finance/reconciliation.js
const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { auth: authenticateToken } = require('../../middleware/auth');

// Import bank transactions from CSV/feed
router.post('/import', authenticateToken, async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { transactions, account_type } = req.body;
    const importedTransactions = [];

    for (const transaction of transactions) {
      const result = await client.query(
        `INSERT INTO bank_transactions (
          account_type, transaction_date, post_date, amount,
          description, merchant_name, merchant_category, reference_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          account_type,
          transaction.date,
          transaction.post_date,
          transaction.amount,
          transaction.description,
          transaction.merchant_name,
          transaction.merchant_category,
          transaction.reference_number
        ]
      );
      importedTransactions.push(result.rows[0]);
    }

    await client.query('COMMIT');
    res.json(importedTransactions);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import transactions' });
  } finally {
    client.release();
  }
});

// Get unreconciled transactions
router.get('/unreconciled', authenticateToken, async (req, res) => {
  try {
    const { account_type, start_date, end_date } = req.query;
    
    const query = `
      SELECT bt.*, ft.id as matched_transaction_id
      FROM bank_transactions bt
      LEFT JOIN finance_transactions ft ON bt.finance_transaction_id = ft.id
      WHERE bt.status = 'pending'
      ${account_type ? 'AND bt.account_type = $1' : ''}
      ${start_date && end_date ? 'AND bt.transaction_date BETWEEN $2 AND $3' : ''}
      ORDER BY bt.transaction_date DESC
    `;

    const params = [];
    if (account_type) params.push(account_type);
    if (start_date && end_date) params.push(start_date, end_date);

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching unreconciled transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Match transactions
router.post('/match', authenticateToken, async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { bank_transaction_id, finance_transaction_id } = req.body;

    // Update bank transaction
    await client.query(
      `UPDATE bank_transactions 
       SET finance_transaction_id = $1,
           status = 'reconciled',
           reconciled_at = NOW(),
           reconciled_by = $2
       WHERE id = $3`,
      [finance_transaction_id, req.user.id, bank_transaction_id]
    );

    // Update finance transaction status
    await client.query(
      `UPDATE finance_transactions 
       SET status = 'reconciled',
           updated_at = NOW(),
           updated_by = $1
       WHERE id = $2`,
      [req.user.id, finance_transaction_id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Transactions matched successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Matching error:', error);
    res.status(500).json({ error: 'Failed to match transactions' });
  } finally {
    client.release();
  }
});

// Unmatch transactions
router.post('/unmatch', authenticateToken, async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { bank_transaction_id } = req.body;

    // Get finance transaction ID before unmatching
    const bankTxResult = await client.query(
      'SELECT finance_transaction_id FROM bank_transactions WHERE id = $1',
      [bank_transaction_id]
    );

    if (bankTxResult.rows.length === 0) {
      throw new Error('Bank transaction not found');
    }

    const { finance_transaction_id } = bankTxResult.rows[0];

    // Reset bank transaction
    await client.query(
      `UPDATE bank_transactions 
       SET finance_transaction_id = NULL,
           status = 'pending',
           reconciled_at = NULL,
           reconciled_by = NULL
       WHERE id = $1`,
      [bank_transaction_id]
    );

    // Reset finance transaction if it exists
    if (finance_transaction_id) {
      await client.query(
        `UPDATE finance_transactions 
         SET status = 'pending',
             updated_at = NOW(),
             updated_by = $1
         WHERE id = $2`,
        [req.user.id, finance_transaction_id]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Transactions unmatched successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Unmatching error:', error);
    res.status(500).json({ error: 'Failed to unmatch transactions' });
  } finally {
    client.release();
  }
});

// Get reconciliation summary
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, account_type } = req.query;

    const query = `
      SELECT
        account_type,
        COUNT(*) as total_transactions,
        COUNT(*) FILTER (WHERE status = 'reconciled') as reconciled_count,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        SUM(amount) as total_amount,
        SUM(amount) FILTER (WHERE status = 'reconciled') as reconciled_amount,
        SUM(amount) FILTER (WHERE status = 'pending') as pending_amount
      FROM bank_transactions
      WHERE transaction_date BETWEEN $1 AND $2
      ${account_type ? 'AND account_type = $3' : ''}
      GROUP BY account_type
    `;

    const params = [start_date || '1900-01-01', end_date || '2100-12-31'];
    if (account_type) params.push(account_type);

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reconciliation summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

module.exports = router;