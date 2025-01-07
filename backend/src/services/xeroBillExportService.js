// src/services/xeroBillExportService.js
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');

const xeroBillExportService = {
  async generateBillCsv(invoice, vendor, materials) {
    const csvWriter = createCsvWriter({
      path: path.join(__dirname, '../../exports', `bill-${invoice.id}.csv`),
      header: [
        { id: 'ContactName', title: 'ContactName' },
        { id: 'EmailAddress', title: 'EmailAddress' },
        { id: 'POAddressLine1', title: 'POAddressLine1' },
        { id: 'POCity', title: 'POCity' },
        { id: 'PORegion', title: 'PORegion' },
        { id: 'POPostalCode', title: 'POPostalCode' },
        { id: 'InvoiceNumber', title: 'InvoiceNumber' },
        { id: 'InvoiceDate', title: 'InvoiceDate' },
        { id: 'DueDate', title: 'DueDate' },
        { id: 'InventoryItemCode', title: 'InventoryItemCode' },
        { id: 'Description', title: 'Description' },
        { id: 'Quantity', title: 'Quantity' },
        { id: 'UnitAmount', title: 'UnitAmount' },
        { id: 'AccountCode', title: 'AccountCode' },
        { id: 'TaxType', title: 'TaxType' }
      ]
    });

    // Create a record for each material in the invoice
    const records = materials.map(material => ({
      ContactName: vendor.name,
      EmailAddress: vendor.email,
      POAddressLine1: vendor.address,
      POCity: vendor.city,
      PORegion: vendor.state,
      POPostalCode: vendor.zip,
      InvoiceNumber: invoice.invoice_number,
      InvoiceDate: new Date(invoice.issue_date).toISOString().split('T')[0],
      DueDate: new Date(invoice.due_date).toISOString().split('T')[0],
      InventoryItemCode: material.sku,
      Description: material.name,
      Quantity: material.quantity,
      UnitAmount: material.unit_price,
      AccountCode: '400', // Standard expense account
      TaxType: 'TAX001' // Default tax type
    }));

    await csvWriter.writeRecords(records);
    return `bill-${invoice.id}.csv`;
  },

  // Export multiple bills
  async generateBulkBillsCsv(bills) {
    const csvWriter = createCsvWriter({
      path: path.join(__dirname, '../../exports', 'bulk-bills.csv'),
      header: [
        { id: 'ContactName', title: 'ContactName' },
        { id: 'EmailAddress', title: 'EmailAddress' },
        { id: 'POAddressLine1', title: 'POAddressLine1' },
        { id: 'POCity', title: 'POCity' },
        { id: 'PORegion', title: 'PORegion' },
        { id: 'POPostalCode', title: 'POPostalCode' },
        { id: 'InvoiceNumber', title: 'InvoiceNumber' },
        { id: 'InvoiceDate', title: 'InvoiceDate' },
        { id: 'DueDate', title: 'DueDate' },
        { id: 'InventoryItemCode', title: 'InventoryItemCode' },
        { id: 'Description', title: 'Description' },
        { id: 'Quantity', title: 'Quantity' },
        { id: 'UnitAmount', title: 'UnitAmount' },
        { id: 'AccountCode', title: 'AccountCode' },
        { id: 'TaxType', title: 'TaxType' }
      ]
    });

    const records = bills.flatMap(bill => 
      bill.materials.map(material => ({
        ContactName: bill.vendor.name,
        EmailAddress: bill.vendor.email,
        POAddressLine1: bill.vendor.address,
        POCity: bill.vendor.city,
        PORegion: bill.vendor.state,
        POPostalCode: bill.vendor.zip,
        InvoiceNumber: bill.invoice_number,
        InvoiceDate: new Date(bill.issue_date).toISOString().split('T')[0],
        DueDate: new Date(bill.due_date).toISOString().split('T')[0],
        InventoryItemCode: material.sku,
        Description: material.name,
        Quantity: material.quantity,
        UnitAmount: material.unit_price,
        AccountCode: '400',
        TaxType: 'TAX001'
      }))
    );

    await csvWriter.writeRecords(records);
    return 'bulk-bills.csv';
  }
};

module.exports = xeroBillExportService;