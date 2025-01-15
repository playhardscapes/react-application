// src/services/contractActions.js
const db = require('../config/database');
const sendgrid = require('@sendgrid/mail');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const contractActions = {
  /**
   * Send contract to client via email
   */
  sendContract: async function(contractId) {
    const client = await db.pool.connect();
    try {
      // Get contract with client info
      const query = `
        SELECT 
          c.*,
          cl.name as client_name,
          cl.email as client_email
        FROM contracts c
        JOIN clients cl ON c.client_id = cl.id
        WHERE c.id = $1
      `;
      
      const result = await client.query(query, [contractId]);
      if (result.rows.length === 0) {
        throw new Error('Contract not found');
      }

      const contract = result.rows[0];
      
      // Generate PDF
      const pdfPath = await this.generatePDF(contract);
      
      // Send email
      const msg = {
        to: contract.client_email,
        from: process.env.FROM_EMAIL,
        subject: `Contract for Review - ${contract.project_location}`,
        text: `Dear ${contract.client_name},\n\nPlease review and sign the attached contract for your project.\n\nBest regards,\nPlay Hardscapes`,
        attachments: [
          {
            content: fs.readFileSync(pdfPath).toString('base64'),
            filename: `contract-${contractId}.pdf`,
            type: 'application/pdf',
            disposition: 'attachment'
          }
        ]
      };

      await sendgrid.send(msg);

      // Update contract status
      await client.query(
        'UPDATE contracts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['sent', contractId]
      );

      // Clean up PDF file
      fs.unlinkSync(pdfPath);

      return { success: true };
    } catch (error) {
      console.error('Error sending contract:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Sign the contract
   */
  signContract: async function(contractId) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Update contract status
      const contractQuery = `
        UPDATE contracts 
        SET 
          status = 'signed',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await client.query(contractQuery, [contractId]);
      if (result.rows.length === 0) {
        throw new Error('Contract not found');
      }

      const contract = result.rows[0];

      // Create project
      const projectQuery = `
        INSERT INTO projects (
          contract_id,
          client_id,
          status,
          created_at,
          updated_at
        ) VALUES ($1, $2, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `;

      await client.query(projectQuery, [
        contract.id,
        contract.client_id
      ]);

      await client.query('COMMIT');
      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error signing contract:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Generate PDF version of contract
   */
  generatePDF: async function(contract) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const filePath = path.join(__dirname, `../temp/contract-${contract.id}.pdf`);
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // Add company logo
      // doc.image('path/to/logo.png', 50, 45, { width: 150 });

      // Add header
      doc
        .fontSize(20)
        .text('CONSTRUCTION CONTRACT', { align: 'center' })
        .moveDown();

      // Add contract details
      doc
        .fontSize(12)
        .text(`Contract #: ${contract.id}`)
        .text(`Date: ${new Date().toLocaleDateString()}`)
        .text(`Client: ${contract.client_name}`)
        .text(`Project Location: ${contract.project_location}`)
        .moveDown();

      // Add contract content
      doc
        .fontSize(12)
        .text(contract.content)
        .moveDown();

      // Add signature lines
      doc
        .moveDown(2)
        .text('________________________', { align: 'left' })
        .text('Client Signature', { align: 'left' })
        .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'left' })
        .moveDown()
        .text('________________________', { align: 'left' })
        .text('Company Representative', { align: 'left' })
        .text(`Date: ${new Date