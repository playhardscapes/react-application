// src/services/documentService.js
const db = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

const documentService = {
  // Document Core Operations
  async uploadDocument(documentData) {
    const {
      entity_type,
      entity_id,
      file,
      category,
      description,
      user_id,
      tags = [],
      metadata = {},
      is_confidential = false
    } = documentData;

    if (!file) throw new Error('No file provided');

    const filename = `${Date.now()}-${file.originalname}`;
    const uploadPath = path.join(__dirname, '..', '..', 'uploads', entity_type || 'general');
    await fs.mkdir(uploadPath, { recursive: true });
    const filePath = path.join(uploadPath, filename);
    await fs.rename(file.path, filePath);

    const client = await db.connect();

    try {
      await client.query('BEGIN');

      const documentQuery = `
        INSERT INTO documents (
          entity_type, 
          entity_id, 
          filename, 
          original_name, 
          file_path, 
          file_size, 
          mime_type, 
          category, 
          description,
          status,
          metadata,
          is_confidential,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const documentValues = [
        entity_type || 'general',
        entity_id || null,
        filename,
        file.originalname,
        filePath,
        file.size,
        file.mimetype,
        category || null,
        description || null,
        'active',
        JSON.stringify(metadata),
        is_confidential
      ];

      const documentResult = await client.query(documentQuery, documentValues);
      const documentId = documentResult.rows[0].id;

      if (tags.length > 0) {
        const tagQueries = tags.map(tag => 
          client.query(
            'INSERT INTO document_tags (document_id, tag_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [documentId, tag]
          )
        );
        await Promise.all(tagQueries);
      }

      await client.query('COMMIT');
      return documentResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Document Retrieval and Search
  async getDocumentsByEntity(entityType, entityId) {
    const query = `
      SELECT d.*, array_agg(dt.tag_name) as tags
      FROM documents d
      LEFT JOIN document_tags dt ON d.id = dt.document_id
      WHERE d.entity_type = $1 
      AND d.entity_id = $2
      AND d.status = 'active'
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `;
    
    const result = await db.query(query, [entityType, entityId]);
    return result.rows;
  },

  // Access Logging
  async logDocumentAccess(documentId, userId, accessType, ipAddress) {
    const query = `
      INSERT INTO document_access_logs (
        document_id, 
        user_id, 
        access_type, 
        ip_address
      ) VALUES ($1, $2, $3, $4)
    `;
    await db.query(query, [documentId, userId, accessType, ipAddress]);
  }
};
  
module.exports = documentService;