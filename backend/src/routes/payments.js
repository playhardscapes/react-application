// src/routes/payments.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get payments for an invoice
router.get('/invoices/:id/payments', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*,
        i.invoice_number,
        i.amount as invoice_amount
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      WHERE p.invoice_id = $1
      ORDER BY p.payment_date DESC
    `;
    
    const result = await db.query(query, [req.params.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Record a new payment
router.post('/invoices/:id/payments', async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const { amount, date, reference, payment_method = 'check', notes = '' } = req.body;
    
    // Insert payment
    const paymentQuery = `
      INSERT INTO payments (
        invoice_id, amount, payment_date, reference_number, 
        payment_method, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const paymentResult = await client.query(paymentQuery, [
      req.params.id,
      amount,
      date,
      reference,
      payment_method,
      notes
    ]);

    // Get the updated invoice status
    const invoiceQuery = `
      SELECT i.*, v.name as vendor_name
      FROM invoices i
      JOIN vendors v ON i.vendor_id = v.id
      WHERE i.id = $1
    `;
    
    const invoiceResult = await client.query(invoiceQuery, [req.params.id]);
    
    await client.query('COMMIT');
    
    res.json({
      payment: paymentResult.rows[0],
      invoice: invoiceResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  } finally {
    client.release();
  }
});

// Delete a payment
router.delete('/payments/:id', async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Get the invoice_id before deleting the payment
    const checkQuery = 'SELECT invoice_id FROM payments WHERE id = $1';
    const checkResult = await client.query(checkQuery, [req.params.id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    const invoiceId = checkResult.rows[0].invoice_id;

    // Delete the payment
    const deleteQuery = 'DELETE FROM payments WHERE id = $1';
    await client.query(deleteQuery, [req.params.id]);
    
    // Get updated invoice details
    const invoiceQuery = `
      SELECT i.*, v.name as vendor_name
      FROM invoices i
      JOIN vendors v ON i.vendor_id = v.id
      WHERE i.id = $1
    `;
    
    const invoiceResult = await client.query(invoiceQuery, [invoiceId]);
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      invoice: invoiceResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  } finally {
    client.release();
  }
});

// Get payment summary for a date range
router.get('/payments/summary', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const query = `
      SELECT 
        SUM(p.amount) as total_paid,
        COUNT(DISTINCT p.invoice_id) as invoices_paid,
        COUNT(p.*) as payment_count
      FROM payments p
      WHERE p.payment_date BETWEEN $1 AND $2
    `;
    
    const result = await db.query(query, [start_date || '1900-01-01', end_date || '2100-12-31']);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    res.status(500).json({ error: 'Failed to fetch payment summary' });
  }
});

module.exports = router;