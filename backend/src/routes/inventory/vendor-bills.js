// src/routes/inventory/vendorBills.js
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const validate = require('../../middleware/validation');
const vendorBillsService = require('../../services/vendorBillsService');

// Get all vendor bills
router.get('/', async (req, res) => {
  try {
    const { status, vendorId } = req.query;
    const bills = await vendorBillsService.getAllBills({ status, vendorId });
    res.json(bills);
  } catch (error) {
    console.error('Error fetching vendor bills:', error);
    res.status(500).json({ error: 'Failed to fetch vendor bills' });
  }
});

// Create vendor bill
router.post('/', [
  body('purchaseOrderId').isInt().notEmpty(),
  body('items').isArray({ min: 1 }),
  body('items.*.materialId').isInt(),
  body('items.*.quantity').isFloat({ min: 0.01 }),
  body('items.*.unitPrice').isFloat({ min: 0.01 }),
  body('issueDate').isISO8601(),
  body('dueDate').isISO8601(),
  body('additionalCharges').optional().isArray(),
  body('additionalCharges.*.type').optional().isString(),
  body('additionalCharges.*.amount').optional().isFloat({ min: 0 }),
  body('additionalCharges.*.description').optional().isString(),
  validate
], async (req, res) => {
  try {
    const bill = await vendorBillsService.createBill(req.body);
    res.status(201).json(bill);
  } catch (error) {
    console.error('Error creating vendor bill:', error);
    res.status(500).json({ error: 'Failed to create vendor bill' });
  }
});

// Get single vendor bill
router.get('/:id', [
  param('id').isInt(),
  validate
], async (req, res) => {
  try {
    const bill = await vendorBillsService.getBillById(req.params.id);
    if (!bill) {
      return res.status(404).json({ error: 'Vendor bill not found' });
    }
    res.json(bill);
  } catch (error) {
    console.error('Error fetching vendor bill:', error);
    res.status(500).json({ error: 'Failed to fetch vendor bill' });
  }
});

// Update vendor bill
router.put('/:id', [
  param('id').isInt(),
  body('items').isArray({ min: 1 }),
  body('items.*.materialId').isInt(),
  body('items.*.quantity').isFloat({ min: 0.01 }),
  body('items.*.unitPrice').isFloat({ min: 0.01 }),
  body('issueDate').isISO8601(),
  body('dueDate').isISO8601(),
  body('additionalCharges').optional().isArray(),
  body('additionalCharges.*.type').optional().isString(),
  body('additionalCharges.*.amount').optional().isFloat({ min: 0 }),
  body('additionalCharges.*.description').optional().isString(),
  validate
], async (req, res) => {
  try {
    const bill = await vendorBillsService.updateBill(req.params.id, req.body);
    res.json(bill);
  } catch (error) {
    console.error('Error updating vendor bill:', error);
    res.status(500).json({ error: 'Failed to update vendor bill' });
  }
});

// Mark bill as paid
router.post('/:id/pay', [
  param('id').isInt(),
  body('paidDate').optional().isISO8601(),
  body('paymentReference').optional().isString(),
  validate
], async (req, res) => {
  try {
    const bill = await vendorBillsService.markBillAsPaid(req.params.id, {
      paidDate: req.body.paidDate,
      paymentReference: req.body.paymentReference
    });
    res.json(bill);
  } catch (error) {
    console.error('Error marking bill as paid:', error);
    res.status(500).json({ error: 'Failed to mark bill as paid' });
  }
});

module.exports = router;