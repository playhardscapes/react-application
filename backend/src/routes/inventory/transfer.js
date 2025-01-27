// src/routes/inventory/transfer.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const stockTransferService = require('../../services/stockTransferService');

router.post('/', [
  body('materialId').isInt(),
  body('fromLocationId').isInt(),
  body('toLocationId').isInt(),
  body('quantity').isFloat({ min: 0.01 })
], async (req, res) => {
  try {
    const transfer = await stockTransferService.createTransfer(req.body);
    res.status(201).json(transfer);
  } catch (error) {
    console.error('Error creating stock transfer:', error);
    
    if (error.message === 'Insufficient stock at source location') {
      return res.status(400).json({ 
        error: 'Invalid Transfer',
        message: 'Insufficient stock at source location'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create stock transfer',
      message: error.message 
    });
  }
});

module.exports = router;