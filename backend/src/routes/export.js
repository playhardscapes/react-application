// src/routes/export.js
const express = require('express');
const router = express.Router();
const xeroBillExportService = require('../services/xeroBillExportService');
const db = require('../config/database');

router.post('/vendors/invoices/:id/export-xero', async (req, res) => {
  try {
    const invoiceId = req.params.id;
    
    // Get invoice with vendor and materials data
    const query = `
      SELECT 
        i.*,
        v.*,
        m.name as material_name,
        m.sku,
        it.quantity,
        it.unit_price
      FROM invoices i
      JOIN vendors v ON i.vendor_id = v.id
      JOIN inventory_transactions it ON i.id = it.invoice_id
      JOIN materials m ON it.material_id = m.id
      WHERE i.id = $1
    `;
    
    const result = await db.query(query, [invoiceId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = result.rows[0];
    const materials = result.rows.map(row => ({
      name: row.material_name,
      sku: row.sku,
      quantity: row.quantity,
      unit_price: row.unit_price
    }));

    const fileName = await xeroBillExportService.generateBillCsv(invoice, {
      name: invoice.name,
      email: invoice.email,
      address: invoice.address,
      city: invoice.city,
      state: invoice.state,
      zip: invoice.postal_code
    }, materials);

    res.download(path.join(__dirname, '../../exports', fileName));
  } catch (error) {
    console.error('Error exporting bill:', error);
    res.status(500).json({ error: 'Failed to export bill' });
  }
});

// Bulk export route
router.post('/vendors/invoices/export-bulk', async (req, res) => {
  try {
    const { invoiceIds } = req.body;
    
    // Get all invoices with vendor and materials data
    const query = `
      SELECT 
        i.*,
        v.*,
        m.name as material_name,
        m.sku,
        it.quantity,
        it.unit_price
      FROM invoices i
      JOIN vendors v ON i.vendor_id = v.id
      JOIN inventory_transactions it ON i.id = it.invoice_id
      JOIN materials m ON it.material_id = m.id
      WHERE i.id = ANY($1)
    `;
    
    const result = await db.query(query, [invoiceIds]);
    
    // Group by invoice
    const bills = Object.values(result.rows.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          ...row,
          materials: []
        };
      }
      acc[row.id].materials.push({
        name: row.material_name,
        sku: row.sku,
        quantity: row.quantity,
        unit_price: row.unit_price
      });
      return acc;
    }, {}));

    const fileName = await xeroBillExportService.generateBulkBillsCsv(bills);
    res.download(path.join(__dirname, '../../exports', fileName));
  } catch (error) {
    console.error('Error exporting bills:', error);
    res.status(500).json({ error: 'Failed to export bills' });
  }
});

module.exports = router;