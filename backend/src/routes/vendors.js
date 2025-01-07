// src/routes/vendors.js
const express = require('express');
const router = express.Router();
const vendorService = require('../services/vendorService');

// Get upcoming payments (must be before /:id routes)
router.get('/vendors/upcoming-payments', async (req, res) => {
  try {
    const payments = await vendorService.getUpcomingPayments();
    res.json(payments);
  } catch (error) {
    console.error('Error fetching upcoming payments:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming payments' });
  }
});

// Get all vendors
router.get('/vendors', async (req, res) => {
  try {
    const vendors = await vendorService.getAllVendors();
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// Create vendor
router.post('/vendors', async (req, res) => {
  try {
    const vendor = await vendorService.createVendor(req.body);
    res.status(201).json(vendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

// Get vendor invoices (must be before /:id route)
router.get('/vendors/:id/invoices', async (req, res) => {
  try {
    const invoices = await vendorService.getVendorInvoices(req.params.id);
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching vendor invoices:', error);
    res.status(500).json({ error: 'Failed to fetch vendor invoices' });
  }
});

// Get single vendor by ID
router.get('/vendors/:id', async (req, res) => {
  try {
    const vendor = await vendorService.getVendorById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
});

// Update vendor
router.put('/vendors/:id', async (req, res) => {
  try {
    const vendor = await vendorService.updateVendor(req.params.id, req.body);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ error: 'Failed to update vendor' });
  }
});

// Delete vendor
router.delete('/vendors/:id', async (req, res) => {
  try {
    const result = await vendorService.deleteVendor(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

module.exports = router;