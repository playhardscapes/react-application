// src/routes/finance/expenses.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth: authenticateToken } = require('../../middleware/auth');
const financeDocumentService = require('../../services/financeDocumentService');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

router.post('/upload', 
  authenticateToken,
  upload.single('receipt'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const result = await financeDocumentService.processReceipt(
        req.file,
        req.user.id
      );

      res.json(result);
    } catch (error) {
      console.error('Receipt upload error:', error);
      res.status(500).json({ error: 'Failed to process receipt' });
    }
  }
);

module.exports = router;