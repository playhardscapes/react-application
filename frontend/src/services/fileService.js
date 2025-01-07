// src/services/fileService.js
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const dir = path.join(__dirname, '../../uploads/invoices');
    try {
      await fs.mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const fileService = {
  // Save file information to database
  async saveFileInfo(db, fileData) {
    const query = `
      INSERT INTO invoice_files (
        invoice_id,
        filename,
        original_name,
        file_path,
        file_size
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      fileData.invoiceId,
      fileData.filename,
      fileData.originalName,
      fileData.filePath,
      fileData.fileSize
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Get files for an invoice
  async getInvoiceFiles(db, invoiceId) {
    const query = `
      SELECT * FROM invoice_files
      WHERE invoice_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query, [invoiceId]);
    return result.rows;
  },

  // Delete file
  async deleteFile(db, fileId) {
    // First get file info
    const query = `
      SELECT * FROM invoice_files
      WHERE id = $1
    `;
    
    const result = await db.query(query, [fileId]);
    const file = result.rows[0];

    if (file) {
      // Delete physical file
      await fs.unlink(file.file_path);

      // Delete database record
      await db.query('DELETE FROM invoice_files WHERE id = $1', [fileId]);
    }
  }
};

module.exports = {
  upload,
  fileService
};