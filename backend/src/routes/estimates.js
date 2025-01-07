// routes/estimates.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// Get all estimates
router.get('/estimates', async (req, res) => {
  try {
    // In a real app, this would come from a database
    // For now, we'll return some dummy data
    const estimates = [
      {
        id: 1,
        clientName: 'Example Client',
        date: '2024-01-15',
        location: 'Example Location',
        total: 25000,
        status: 'Pending'
      }
    ];
    
    res.json(estimates);
  } catch (error) {
    console.error('Error fetching estimates:', error);
    res.status(500).json({ error: 'Failed to fetch estimates' });
  }
});

// Get a single estimate by ID
router.get('/estimates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // In a real app, fetch from database
    // For now, return dummy data
    const estimate = {
      id: parseInt(id),
      clientName: 'Example Client',
      date: '2024-01-15',
      location: 'Example Location',
      total: 25000,
      status: 'Pending'
    };
    
    res.json(estimate);
  } catch (error) {
    console.error('Error fetching estimate:', error);
    res.status(500).json({ error: 'Failed to fetch estimate' });
  }
});

module.exports = router;