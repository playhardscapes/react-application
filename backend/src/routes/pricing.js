// server/routes/pricing.js
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const PRICING_FILE = path.join(__dirname, '../data/pricing.json');

// Get current pricing
router.get('/pricing', async (req, res) => {
  try {
    const data = await fs.readFile(PRICING_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to load pricing data' });
  }
});

// Update pricing
router.post('/pricing', async (req, res) => {
  try {
    const newPricing = req.body;
    await fs.writeFile(PRICING_FILE, JSON.stringify(newPricing, null, 2));
    res.json({ message: 'Pricing updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update pricing data' });
  }
});

module.exports = router;
