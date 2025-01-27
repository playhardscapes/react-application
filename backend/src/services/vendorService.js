// src/services/vendorService.js
const db = require('../config/database');

const vendorService = {
  getAllVendors: async function() {
    try {
      const query = `
        SELECT 
          v.*,
          COUNT(i.id) as open_invoices,
          SUM(CASE WHEN i.status = 'pending' THEN i.amount ELSE 0 END) as total_outstanding
        FROM vendors v
        LEFT JOIN invoices i ON v.id = i.vendor_id AND i.status = 'pending'
        GROUP BY v.id
        ORDER BY v.name
      `;
      const result = await db.query(query);
      return result.rows || []; // Ensure an array is always returned
    } catch (error) {
      console.error('Error in getAllVendors:', error);
      return []; // Return empty array on error
    }
  },

  getVendorById: async function(id) {
    const query = `
      SELECT v.*, 
        COUNT(i.id) as open_invoices,
        SUM(CASE WHEN i.status = 'pending' THEN i.amount ELSE 0 END) as total_outstanding
      FROM vendors v
      LEFT JOIN invoices i ON v.id = i.vendor_id AND i.status = 'pending'
      WHERE v.id = $1
      GROUP BY v.id
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  createVendor: async function(vendorData) {
    const {
      name,
      email,
      phone,
      address,
      city,
      state,           // Added state
      postal_code,
      payment_terms,
      notes,
      vendor_type,
      sales_contact_name,
      sales_contact_email,
      sales_contact_phone,
      ap_contact_name,
      ap_contact_email,
      ap_contact_phone
    } = vendorData;

    const query = `
      INSERT INTO vendors (
        name,
        email,
        phone,
        address,
        city,
        state,          
        postal_code,
        payment_terms,
        notes,
        vendor_type,
        sales_contact_name,
        sales_contact_email,
        sales_contact_phone,
        ap_contact_name,
        ap_contact_email,
        ap_contact_phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    
    const values = [
      name,
      email || null,
      phone || null,
      address || null,
      city || null,
      state || null,        // Added state
      postal_code || vendorData.zip || null,
      payment_terms || null,
      notes || null,
      vendor_type || null,
      sales_contact_name || null,
      sales_contact_email || null,
      sales_contact_phone || null,
      ap_contact_name || null,
      ap_contact_email || null,
      ap_contact_phone || null
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  updateVendor: async function(id, vendorData) {
    // Map zip to postal_code if it exists
    if (vendorData.zip && !vendorData.postal_code) {
      vendorData.postal_code = vendorData.zip;
      delete vendorData.zip;
    }

    const fields = Object.keys(vendorData)
      .filter(key => vendorData[key] !== undefined)
      .map((key, index) => `${key} = $${index + 2}`);
    
    const values = Object.values(vendorData)
      .filter(value => value !== undefined);

    const query = `
      UPDATE vendors 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await db.query(query, [id, ...values]);
    return result.rows[0];
  },

  deleteVendor: async function(id) {
    // First check if vendor has any invoices
    const checkQuery = `
      SELECT COUNT(*) FROM invoices WHERE vendor_id = $1
    `;
    const checkResult = await db.query(checkQuery, [id]);
    if (parseInt(checkResult.rows[0].count) > 0) {
      throw new Error('Cannot delete vendor with existing invoices');
    }

    const query = `
      DELETE FROM vendors
      WHERE id = $1
      RETURNING id
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  getVendorInvoices: async function(vendorId) {
    const query = `
      SELECT * FROM invoices
      WHERE vendor_id = $1
      ORDER BY due_date ASC
    `;
    const result = await db.query(query, [vendorId]);
    return result.rows;
  },

  getUpcomingPayments: async function() {
    const query = `
      SELECT 
        i.*,
        v.name as vendor_name,
        v.email as vendor_email
      FROM invoices i
      JOIN vendors v ON i.vendor_id = v.id
      WHERE i.status = 'pending'
      AND i.due_date <= CURRENT_DATE + interval '7 days'
      ORDER BY i.due_date ASC
    `;
    const result = await db.query(query);
    return result.rows;
  }
};

module.exports = vendorService;