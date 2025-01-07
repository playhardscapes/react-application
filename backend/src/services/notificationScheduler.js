// src/services/notificationScheduler.js
const cron = require('node-cron');
const db = require('../config/database');
const emailService = require('./emailService');

const notificationScheduler = {
  // Check for upcoming payments daily at 9am
  schedulePaymentReminders() {
    cron.schedule('0 9 * * *', async () => {
      try {
        // Get invoices due in the next 3 days
        const query = `
          SELECT i.*, v.* 
          FROM invoices i
          JOIN vendors v ON i.vendor_id = v.id
          WHERE i.status = 'pending'
          AND i.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
        `;
        
        const result = await db.query(query);
        
        for (const row of result.rows) {
          if (row.email) { // Only send if vendor has email
            await emailService.sendPaymentReminder(row, {
              name: row.name,
              email: row.email,
              phone: row.phone,
              payment_terms: row.payment_terms
            });
          }
        }
      } catch (error) {
        console.error('Error processing payment reminders:', error);
      }
    });
  },

  // Check for overdue payments daily at 9am
  scheduleOverdueNotifications() {
    cron.schedule('0 9 * * *', async () => {
      try {
        // Get overdue invoices
        const query = `
          SELECT i.*, v.* 
          FROM invoices i
          JOIN vendors v ON i.vendor_id = v.id
          WHERE i.status = 'pending'
          AND i.due_date < CURRENT_DATE
        `;
        
        const result = await db.query(query);
        
        for (const row of result.rows) {
          if (row.email) { // Only send if vendor has email
            await emailService.sendOverdueNotification(row, {
              name: row.name,
              email: row.email,
              phone: row.phone,
              payment_terms: row.payment_terms
            });
          }
        }
      } catch (error) {
        console.error('Error processing overdue notifications:', error);
      }
    });
  },

  // Send weekly summary every Monday at 8am
  scheduleWeeklySummary() {
    cron.schedule('0 8 * * 1', async () => {
      try {
        const query = `
          SELECT 
            i.*,
            v.name as vendor_name,
            SUM(CASE WHEN i.status = 'pending' THEN i.amount ELSE 0 END) 
              OVER () as total_outstanding
          FROM invoices i
          JOIN vendors v ON i.vendor_id = v.id
          WHERE i.status = 'pending'
          ORDER BY i.due_date ASC
        `;
        
        const result = await db.query(query);
        
        if (result.rows.length > 0) {
          const totalOutstanding = result.rows[0].total_outstanding;
          await emailService.sendWeeklySummary(result.rows, totalOutstanding);
        }
      } catch (error) {
        console.error('Error processing weekly summary:', error);
      }
    });
  },

  // Initialize all schedulers
  init() {
    // Only initialize if SendGrid is configured
    if (process.env.SENDGRID_API_KEY) {
      this.schedulePaymentReminders();
      this.scheduleOverdueNotifications();
      this.scheduleWeeklySummary();
      console.log('Notification schedulers initialized');
    } else {
      console.log('SendGrid not configured - notifications disabled');
    }
  }
};

module.exports = notificationScheduler;