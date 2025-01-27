// src/services/financeDocumentService.js
const documentService = require('./documentService');
const db = require('../config/database');

const financeDocumentService = {
  async processReceipt(file, userId, transactionId = null) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      const document = await documentService.uploadDocument({
        file,
        user_id: userId,
        category: 'receipt',
        description: 'Financial Receipt',
        is_confidential: true
      });

      if (transactionId) {
        await client.query(
          'UPDATE finance_transactions SET receipt_id = $1 WHERE id = $2',
          [document.id, transactionId]
        );
      }

      await client.query('COMMIT');
      
      return {
        documentId: document.id,
        extractedText: "Mock OCR text for testing",
        parsed: {
          amount: 100.00,
          date: "2024-01-23",
          vendorName: "Test Vendor",
          lineItems: []
        }
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async linkReceiptToTransaction(documentId, transactionId) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      await client.query(
        'UPDATE finance_transactions SET receipt_id = $1 WHERE id = $2',
        [documentId, transactionId]
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = financeDocumentService;