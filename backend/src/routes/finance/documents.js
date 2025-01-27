// src/routes/api/finance/documents.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth: authenticateToken } = require('../../middleware/auth');
const financeDocumentService = require('../../services/financeDocumentService');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/process-receipt', 
  authenticateToken,
  upload.single('receipt'),
  async (req, res) => {
    try {
      const result = await financeDocumentService.processReceipt(
        req.file,
        req.user.id,
        req.body.transactionId || null
      );
      res.json(result);
    } catch (error) {
      console.error('Receipt processing error:', error);
      res.status(500).json({ error: 'Failed to process receipt' });
    }
  }
);

router.post('/link/:documentId/:transactionId',
  authenticateToken,
  async (req, res) => {
    try {
      await financeDocumentService.linkReceiptToTransaction(
        req.params.documentId,
        req.params.transactionId,
        req.user.id
      );
      res.json({ message: 'Receipt linked successfully' });
    } catch (error) {
      console.error('Error linking receipt:', error);
      res.status(500).json({ error: 'Failed to link receipt' });
    }
  }
);

module.exports = router;