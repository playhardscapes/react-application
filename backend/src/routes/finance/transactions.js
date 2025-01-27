// src/routes/api/finance/transactions.js
const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { auth: authenticateToken } = require('../../middleware/auth');
const { upload } = require('../../middleware/upload');

// Create transaction
router.post('/', authenticateToken, async (req, res) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      date,
      amount,
      description,
      vendor_id,
      payment_method,
      category,
      project_allocations = []
    } = req.body;

    // Insert transaction
    const transactionResult = await client.query(
      `INSERT INTO finance_transactions (
        date, amount, description, vendor_id, payment_method, category, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [date, amount, description, vendor_id, payment_method, category, req.user.id]
    );

    const transactionId = transactionResult.rows[0].id;

    // Insert allocations if any
    if (project_allocations.length > 0) {
      const allocationValues = project_allocations.map(allocation => [
        transactionId,
        allocation.project_id,
        allocation.amount,
        allocation.percentage,
        allocation.notes,
        req.user.id
      ]);

      const allocationQuery = `
        INSERT INTO transaction_allocations (
          transaction_id, project_id, amount, percentage, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;

      await Promise.all(allocationValues.map(values => 
        client.query(allocationQuery, values)
      ));
    }

    await client.query('COMMIT');
    res.status(201).json({ id: transactionId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction creation error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  } finally {
    client.release();
  }
});

// Get transactions with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      status,
      category,
      vendor_id,
      project_id,
      payment_method,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [];
    let paramCount = 0;
    
    // Build query conditions
    const conditions = ['deleted_at IS NULL'];

    if (start_date && end_date) {
      conditions.push(`date BETWEEN $${++paramCount} AND $${++paramCount}`);
      params.push(start_date, end_date);
    }

    if (status) {
      conditions.push(`status = $${++paramCount}`);
      params.push(status);
    }

    if (category) {
      conditions.push(`category = $${++paramCount}`);
      params.push(category);
    }

    if (vendor_id) {
      conditions.push(`vendor_id = $${++paramCount}`);
      params.push(vendor_id);
    }

    if (payment_method) {
      conditions.push(`payment_method = $${++paramCount}`);
      params.push(payment_method);
    }

    if (project_id) {
      conditions.push(`
        EXISTS (
          SELECT 1 FROM transaction_allocations 
          WHERE transaction_id = finance_transactions.id 
          AND project_id = $${++paramCount}
        )
      `);
      params.push(project_id);
    }

    const query = `
      SELECT 
        t.*,
        v.name as vendor_name,
        json_agg(DISTINCT jsonb_build_object(
          'project_id', ta.project_id,
          'amount', ta.amount,
          'percentage', ta.percentage
        )) as allocations
      FROM finance_transactions t
      LEFT JOIN vendors v ON t.vendor_id = v.id
      LEFT JOIN transaction_allocations ta ON t.id = ta.transaction_id
      WHERE ${conditions.join(' AND ')}
      GROUP BY t.id, v.name
      ORDER BY t.date DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;

    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transaction details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        t.*,
        v.name as vendor_name,
        json_agg(DISTINCT jsonb_build_object(
          'project_id', ta.project_id,
          'amount', ta.amount,
          'percentage', ta.percentage,
          'notes', ta.notes
        )) as allocations,
        json_agg(DISTINCT jsonb_build_object(
          'id', d.id,
          'filename', d.filename
        )) as documents
      FROM finance_transactions t
      LEFT JOIN vendors v ON t.vendor_id = v.id
      LEFT JOIN transaction_allocations ta ON t.id = ta.transaction_id
      LEFT JOIN documents d ON t.id = d.entity_id AND d.entity_type = 'finance_transaction'
      WHERE t.id = $1 AND t.deleted_at IS NULL
      GROUP BY t.id, v.name`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Update transaction
router.put('/:id', authenticateToken, async (req, res) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');

    const {
      date,
      amount,
      description,
      vendor_id,
      payment_method,
      category,
      project_allocations = []
    } = req.body;

    // Update transaction
    const result = await client.query(
      `UPDATE finance_transactions 
       SET date = $1, amount = $2, description = $3, vendor_id = $4,
           payment_method = $5, category = $6, updated_by = $7, updated_at = NOW()
       WHERE id = $8 AND deleted_at IS NULL
       RETURNING *`,
      [date, amount, description, vendor_id, payment_method, category, req.user.id, req.params.id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update allocations
    await client.query(
      'DELETE FROM transaction_allocations WHERE transaction_id = $1',
      [req.params.id]
    );

    if (project_allocations.length > 0) {
      const allocationValues = project_allocations.map(allocation => [
        req.params.id,
        allocation.project_id,
        allocation.amount,
        allocation.percentage,
        allocation.notes,
        req.user.id
      ]);

      const allocationQuery = `
        INSERT INTO transaction_allocations (
          transaction_id, project_id, amount, percentage, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;

      await Promise.all(allocationValues.map(values => 
        client.query(allocationQuery, values)
      ));
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  } finally {
    client.release();
  }
});

// Delete transaction
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE finance_transactions 
       SET deleted_at = NOW(), updated_by = $1
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [req.user.id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

module.exports = router;