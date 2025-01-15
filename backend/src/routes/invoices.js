// src/routes/invoices.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { 
  validate, 
  invoiceValidationRules,
  paginationValidationRules 
} = require('../middleware/validation');
const { body, param } = require('express-validator');

// Get all invoices
router.get('/invoices', 
  validate(paginationValidationRules),
  async (req, res) => {
    try {
      const { page, limit, status, vendorId } = req.query;
      
      const query = `
        SELECT i.*, v.name as vendor_name
        FROM invoices i
        JOIN vendors v ON i.vendor_id = v.id
        ${status ? 'WHERE i.status = $1' : ''}
        ${vendorId ? (status ? 'AND' : 'WHERE') + ' i.vendor_id = $' + (status ? 2 : 1) : ''}
        ORDER BY i.due_date ASC
        ${page && limit ? `LIMIT $${status && vendorId ? 3 : status || vendorId ? 2 : 1} OFFSET $${status && vendorId ? 4 : status || vendorId ? 3 : 2}` : ''}
      `;
      
      const queryParams = [];
      if (status) queryParams.push(status);
      if (vendorId) queryParams.push(vendorId);
      if (page && limit) {
        queryParams.push(limit);
        queryParams.push((page - 1) * limit);
      }

      const result = await db.query(query, queryParams);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

// Get single invoice
router.get('/invoices/:id', 
  validate([
    param('id').isInt().withMessage('Invalid invoice ID')
  ]),
  async (req, res) => {
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
router.post('/invoices', 
  validate(invoiceValidationRules.create),
  async (req, res) => {
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
router.post('/invoices/:id/pay', 
  validate([
    param('id').isInt().withMessage('Invalid invoice ID')
  ]),
  async (req, res) => {
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
router.get('/invoices/upcoming', 
  validate(paginationValidationRules),
  async (req, res) => {
    try {
      const { page, limit } = req.query;

      const baseQuery = `
        SELECT i.*, v.name as vendor_name
        FROM invoices i 
        JOIN vendors v ON i.vendor_id = v.id
        WHERE i.status = 'pending'
        AND i.due_date <= CURRENT_DATE + interval '7 days'
        ORDER BY i.due_date ASC
      `;

      const countQuery = `
        SELECT COUNT(*) AS total 
        FROM invoices 
        WHERE status = 'pending' 
        AND due_date <= CURRENT_DATE + interval '7 days'
      `;

      let query = baseQuery;
      const queryParams = [];

      if (page && limit) {
        query += ` LIMIT $1 OFFSET $2`;
        queryParams.push(parseInt(limit), (page - 1) * parseInt(limit));
      }

      const [invoicesResult, countResult] = await Promise.all([
        db.query(query, queryParams), 
        db.query(countQuery)
      ]);

      res.json({
        invoices: invoicesResult.rows,
        total: parseInt(countResult.rows[0].total),
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : invoicesResult.rows.length
      });
    } catch (error) {
      console.error('Error fetching upcoming payments:', error);
      res.status(500).json({ error: 'Failed to fetch upcoming payments' });
    }
});

module.exports = router;