// src/services/emailReceiptService.js
const db = require('../config/database');
const financeDocumentService = require('./financeDocumentService');
const microsoftGraphService = require('./microsoftGraphService');

const EMAIL_CONFIGS = {
  'receipts@playhardscapes.com': {
    type: 'receipt',
    processor: 'default'
  },
  'lowes@playhardscapes.com': {
    type: 'receipt',
    processor: 'lowes',
    vendorId: process.env.LOWES_VENDOR_ID
  },
  'hotels@playhardscapes.com': {
    type: 'receipt',
    processor: 'hotel'
  },
  'fuel@playhardscapes.com': {
    type: 'receipt',
    processor: 'fuel'
  }
};

const emailReceiptService = {
  async checkEmailsForReceipts() {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      // Fetch new emails from Microsoft Graph
      const emails = await microsoftGraphService.client
        .api('/users/patrick@playhardscapes.com/messages')
        .select(['id', 'subject', 'sender', 'receivedDateTime', 'attachments'])
        .filter("startswith(subject,'Receipt') or startswith(subject,'Invoice')")
        .expand('attachments')
        .top(50)
        .get();

      for (const email of emails.value) {
        // Process if this is a receipt email
        const config = EMAIL_CONFIGS[email.toRecipients[0].emailAddress.address.toLowerCase()];
        if (config && email.attachments) {
          
          // Get attachment content
          for (const attachment of email.attachments) {
            const attachmentContent = await microsoftGraphService.client
              .api(`/users/patrick@playhardscapes.com/messages/${email.id}/attachments/${attachment.id}/$value`)
              .get();

            if (isReceiptFile(attachment)) {
              const file = {
                buffer: Buffer.from(attachmentContent),
                originalname: attachment.name,
                mimetype: attachment.contentType
              };

              // Process receipt
              const receiptData = await financeDocumentService.processReceipt(file, 1);

              // Store metadata
              await client.query(
                `UPDATE documents 
                 SET metadata = jsonb_set(
                   metadata, 
                   '{email_data}', 
                   $1::jsonb
                 )
                 WHERE id = $2`,
                [
                  JSON.stringify({
                    microsoft_email_id: email.id,
                    processor: config.processor,
                    vendor_id: config.vendorId
                  }),
                  receiptData.documentId
                ]
              );
            }
          }
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  startEmailMonitoring(intervalMinutes = 15) {
    console.log('Starting email receipt monitoring every', intervalMinutes, 'minutes');
    return setInterval(async () => {
      try {
        await this.checkEmailsForReceipts();
      } catch (error) {
        console.error('Email receipt monitoring error:', error);
      }
    }, intervalMinutes * 60 * 1000);
  }
};

function isReceiptFile(attachment) {
  const receiptTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  return receiptTypes.includes(attachment.contentType);
}

module.exports = emailReceiptService;