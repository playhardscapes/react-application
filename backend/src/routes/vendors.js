// src/routes/vendors.js
const express = require('express');
const router = express.Router();
const vendorService = require('../services/vendorService');
const { auth: authenticateToken } = require('../middleware/auth');

// Get upcoming payments (must be before /:id routes)
router.get('/upcoming-payments', async (req, res) => {
  try {
    const payments = await vendorService.getUpcomingPayments();
    res.json(payments);
  } catch (error) {
    console.error('Error fetching upcoming payments:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming payments' });
  }
});

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await vendorService.getAllVendors();
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// Get single vendor by ID
router.get('/:id', async (req, res) => {
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

// Get vendor invoices
router.get('/:id/invoices', async (req, res) => {
  try {
    const invoices = await vendorService.getVendorInvoices(req.params.id);
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching vendor invoices:', error);
    res.status(500).json({ error: 'Failed to fetch vendor invoices' });
  }
});

// Update vendor
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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