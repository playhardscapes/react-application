// src/services/emailService.js
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

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
      console.log(`Payment reminder sent to ${vendor.email}`);
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
  },

  async sendWeeklySummary(invoices, totalOutstanding) {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid not configured - skipping email send');
      return;
    }

    const msg = {
      to: 'patrick@playhardscapes.com',
      from: 'patrick@playhardscapes.com',
      subject: 'Weekly Payment Summary',
      html: `
        <h2>Weekly Payment Summary</h2>
        <p>Total Outstanding: $${totalOutstanding}</p>
        <p>Number of pending invoices: ${invoices.length}</p>
      `
    };

    try {
      await sgMail.send(msg);
      console.log('Weekly summary sent');
    } catch (error) {
      console.error('Error sending weekly summary:', error);
      throw error;
    }
  }
};

module.exports = emailService;