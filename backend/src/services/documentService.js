// src/services/documentService.js
const db = require('../config/database');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const mime = require('mime-types');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const { type, entityId } = req.params;
    const dir = path.join(__dirname, '../../uploads', type, entityId);
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = mime.extension(file.mimetype);
    cb(null, `${file.originalname}-${uniqueSuffix}.${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const documentService = {
  async saveDocument(documentData) {
    const query = `
      INSERT INTO documents (
        entity_type,
        entity_id,
        filename,
        original_name,
        file_path,
        file_size,
        mime_type,
        category,
        description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      documentData.entityType,
      documentData.entityId,
      documentData.filename,
      documentData.originalName,
      documentData.filePath,
      documentData.fileSize,
      documentData.mimeType,
      documentData.category,
      documentData.description
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  async getDocuments(entityType, entityId) {
    const query = `
      SELECT * FROM documents
      WHERE entity_type = $1 AND entity_id = $2
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [entityType, entityId]);
    return result.rows;
  },

  async deleteDocument(documentId) {
    const query = `
      DELETE FROM documents
      WHERE id = $1
      RETURNING file_path
    `;
    const result = await db.query(query, [documentId]);
    if (result.rows[0]) {
      await fs.unlink(result.rows[0].file_path);
    }
    return result.rows[0];
  },

  async searchDocuments(searchTerm) {
    const query = `
      SELECT d.*, 
        CASE 
          WHEN d.entity_type = 'vendor' THEN v.name
          WHEN d.entity_type = 'proposal' THEN c.name
          ELSE NULL
        END as entity_name
      FROM documents d
      LEFT JOIN vendors v ON d.entity_type = 'vendor' AND d.entity_id = v.id
      LEFT JOIN proposals p ON d.entity_type = 'proposal' AND d.entity_id = p.id
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE 
        d.original_name ILIKE $1 OR 
        d.description ILIKE $1 OR
        d.category ILIKE $1
      ORDER BY d.created_at DESC
    `;
    const result = await db.query(query, [`%${searchTerm}%`]);
    return result.rows;
  }
};

module.exports = { documentService, upload };