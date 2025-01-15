// src/services/xeroBillExportService.js
const path = require('path');
const fs = require('fs').promises;

const xeroBillExportService = {
  async generateBillCsv(invoice, vendor, materials) {
    const fileName = `bill-${invoice.id}.csv`;
    const filePath = path.join(__dirname, '../../exports', fileName);

    // Ensure exports directory exists
    await fs.mkdir(path.join(__dirname, '../../exports'), { recursive: true });

    // Basic CSV generation
    const csvHeader = [
      'Vendor', 
      'Invoice Number', 
      'Amount', 
      'Date', 
      'Materials'
    ].join(',');

    const csvContent = [
      csvHeader,
      `${vendor.name},${invoice.invoice_number},${invoice.amount},${invoice.issue_date},${materials.map(m => m.name).join(';')}`
    ].join('\n');

    await fs.writeFile(filePath, csvContent);

    return fileName;
  },

  async generateBulkBillsCsv(bills) {
    const fileName = `bulk-bills-${Date.now()}.csv`;
    const filePath = path.join(__dirname, '../../exports', fileName);

    // Ensure exports directory exists
    await fs.mkdir(path.join(__dirname, '../../exports'), { recursive: true });

    // Basic CSV generation
    const csvHeader = [
      'Vendor', 
      'Invoice Number', 
      'Amount', 
      'Date', 
      'Materials'
    ].join(',');

    const csvContent = [
      csvHeader,
      ...bills.map(bill => 
        `${bill.vendor_name},${bill.invoice_number},${bill.amount},${bill.issue_date},${bill.materials.map(m => m.name).join(';')}`
      )
    ].join('\n');

    await fs.writeFile(filePath, csvContent);

    return fileName;
  }
};

module.exports = xeroBillExportService;