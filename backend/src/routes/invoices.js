// src/routes/invoices.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all invoices
router.get('/invoices', async (req, res) => {
  try {
    const query = `
      SELECT i.*, v.name as vendor_name
      FROM invoices i
      JOIN vendors v ON i.vendor_id = v.id
      ORDER BY i.due_date ASC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get single invoice
router.get('/invoices/:id', async (req, res) => {
  try {
    const query = `
      SELECT i.*, v.name as vendor_name, v.payment_terms
      FROM invoices i
      JOIN vendors v ON i.vendor_id = v.id
      WHERE i.id = $1
    `;
    const result = await db.query(query, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Create invoice
router.post('/invoices', async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const {
      vendor_id,
      invoice_number,
      amount,
      issue_date,
      due_date,
      materials,
      notes
    } = req.body;

    // Create invoice
    const invoiceQuery = `
      INSERT INTO invoices (
        vendor_id, invoice_number, amount, issue_date, due_date, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *
    `;
    
    const invoiceValues = [vendor_id, invoice_number, amount, issue_date, due_date, notes];
    const invoiceResult = await client.query(invoiceQuery, invoiceValues);
    const invoice = invoiceResult.rows[0];

    // Record materials if provided
    if (materials && materials.length > 0) {
      const materialQuery = `
        INSERT INTO inventory_transactions (
          invoice_id, material_id, quantity, unit_price, transaction_type
        ) VALUES ($1, $2, $3, $4, 'receive')
      `;

      for (const material of materials) {
        await client.query(materialQuery, [
          invoice.id,
          material.id,
          material.quantity,
          material.unit_price
        ]);

        // Update material stock
        await client.query(`
          UPDATE material_stock
          SET quantity = quantity + $1
          WHERE material_id = $2 AND location_id = $3
        `, [material.quantity, material.id, material.location_id]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json(invoice);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  } finally {
    client.release();
  }
});

// Mark invoice as paid
router.post('/invoices/:id/pay', async (req, res) => {
  try {
    const query = `
      UPDATE invoices
      SET 
        status = 'paid',
        paid_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await db.query(query, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    res.status(500).json({ error: 'Failed to mark invoice as paid' });
  }
});

// Get upcoming payments
router.get('/invoices/upcoming', async (req, res) => {
  try {
    const query = `
      SELECT i.*, v.name as vendor_name
      FROM invoices i 
      JOIN vendors v ON i.vendor_id = v.id
      WHERE i.status = 'pending'
      AND i.due_date <= CURRENT_DATE + interval '7 days'
      ORDER BY i.due_date ASC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching upcoming payments:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming payments' });
  }
});

module.exports = router;