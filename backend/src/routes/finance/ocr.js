// src/routes/api/finance/ocr.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const financeDocumentService = require('../../services/financeDocumentService');
const { auth: authenticateToken } = require('../../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

router.post('/process-receipt', 
  authenticateToken,
  upload.single('receipt'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No receipt file provided' });
      }

      const result = await financeDocumentService.processReceipt(req.file, req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Receipt processing error:', error);
      res.status(500).json({ error: 'Failed to process receipt' });
    }
  }
);

router.post('/:receiptId/link/:transactionId',
  authenticateToken,
  async (req, res) => {
    try {
      await financeDocumentService.linkReceiptToTransaction(
        req.params.receiptId,
        req.params.transactionId
      );
      res.json({ message: 'Receipt linked successfully' });
    } catch (error) {
      console.error('Receipt linking error:', error);
      res.status(500).json({ error: 'Failed to link receipt' });
    }
  }
);

module.exports = router;