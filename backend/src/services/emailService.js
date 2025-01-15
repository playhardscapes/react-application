// src/services/emailService.js
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const emailService = {
  async sendPaymentReminder(invoice, vendor) {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid not configured - skipping email send');
      return;
    }

    const msg = {
      to: vendor.email,
      from: 'patrick@playhardscapes.com',
      subject: `Payment Reminder - Invoice #${invoice.invoice_number}`,
      html: `
        <h2>Payment Reminder</h2>
        <p>This is a reminder that invoice #${invoice.invoice_number} for $${invoice.amount} is due on ${new Date(invoice.due_date).toLocaleDateString()}.</p>
      `
    };

    try {
      await sgMail.send(msg);
      console.lconst Imap = require('imap');
      const simpleParser = require('mailparser').simpleParser;
      const db = require('../config/database');
      
      class EmailService {
        constructor() {
          this.imapConfig = {
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASS,
            host: 'outlook.office365.com', // Adjust for your email provider
            port: 993,
            tls: true
          };
        }
      
        async connectAndFetchEmails() {
          return new Promise((resolve, reject) => {
            const imap = new Imap(this.imapConfig);
      
            imap.once('ready', () => {
              imap.openBox('INBOX', false, (err, box) => {
                if (err) {
                  imap.end();
                  return reject(err);
                }
      
                const fetchOptions = {
                  bodies: ['HEADER', 'TEXT'],
                  markSeen: false
                };
      
                const fetch = imap.seq.fetch('1:*', fetchOptions);
      
                fetch.on('message', (msg) => {
                  msg.on('body', async (stream, info) => {
                    try {
                      const parsed = await simpleParser(stream);
                      await this.saveEmail(parsed);
                    } catch (parseErr) {
                      console.error('Email parse error:', parseErr);
                    }
                  });
                });
      
                fetch.once('error', (fetchErr) => {
                  imap.end();
                  reject(fetchErr);
                });
      
                fetch.once('end', () => {
                  imap.end();
                  resolve();
                });
              });
            });
      
            imap.once('error', (err) => {
              reject(err);
            });
      
            imap.connect();
          });
        }
      
        async saveEmail(parsedEmail) {
          const query = `
            INSERT INTO emails (
              sender_email, 
              sender_name, 
              recipient_email, 
              subject, 
              body, 
              html_body, 
              attachments,
              category
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
          `;
      
          const values = [
            parsedEmail.from.value[0].address,
            parsedEmail.from.text,
            parsedEmail.to.text,
            parsedEmail.subject,
            parsedEmail.text,
            parsedEmail.html,
            JSON.stringify(parsedEmail.attachments.map(a => ({
              filename: a.filename,
              contentType: a.contentType,
              size: a.size
            }))),
            this.categorizeEmail(parsedEmail)
          ];
      
          try {
            const result = await db.query(query, values);
            return result.rows[0];
          } catch (error) {
            console.error('Error saving email:', error);
          }
        }
      
        categorizeEmail(parsedEmail) {
          // Implement logic to categorize emails
          const senderEmail = parsedEmail.from.value[0].address.toLowerCase();
          
          if (senderEmail.includes('vendor')) {
            return 'vendor';
          } else if (senderEmail.includes('client')) {
            return 'client';
          }
          
          return 'uncategorized';
        }
      
        // Background job to periodically fetch emails
        startEmailPolling(intervalMinutes = 5) {
          setInterval(async () => {
            try {
              await this.connectAndFetchEmails();
            } catch (error) {
              console.error('Email polling error:', error);
            }
          }, intervalMinutes * 60 * 1000);
        }
      }
      
      module.exports = new EmailService();og(`Payment reminder sent to ${vendor.email}`);
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      throw error;
    }
  },

  async sendOverdueNotification(invoice, vendor) {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid not configured - skipping email send');
      return;
    }

    const msg = {
      to: vendor.email,
      from: 'patrick@playhardscapes.com',
      subject: `Overdue Payment Notice - Invoice #${invoice.invoice_number}`,
      html: `
        <h2>Overdue Payment Notice</h2>
        <p>Invoice #${invoice.invoice_number} for $${invoice.amount} was due on ${new Date(invoice.due_date).toLocaleDateString()}.</p>
      `
    };

    try {
      await sgMail.send(msg);
      console.log(`Overdue notice sent to ${vendor.email}`);
    } catch (error) {
      console.error('Error sending overdue notice:', error);
      throw error;
    }
  }
};

module.exports = emailService;