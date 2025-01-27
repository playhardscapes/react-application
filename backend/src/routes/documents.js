// src/routes/documents.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const db = require('../config/database');
const { auth: authenticateToken } = require('../middleware/auth');

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { entityType } = req.params;
      
      // Validate entityType
      if (!entityType || entityType === 'undefined') {
        return cb(new Error('Invalid entity type'), null);
      }

      const uploadPath = path.join(__dirname, '..', '..', 'uploads', entityType);
      
      // Create directory if it doesn't exist
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Limit to single file upload
  },
  fileFilter: (req, file, cb) => {
    // Optional: Add file type filtering
    const allowedTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// -------------------
// Routes start here
// -------------------

// Search documents route (must come before parameterized routes)
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      entity_type,
      search,
      categories,
      date_from,
      date_to,
      file_types
    } = req.query;

    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = ['status = $1'];
    const params = ['active'];
    let paramCount = 1;

    if (entity_type) {
      paramCount++;
      conditions.push(`entity_type = $${paramCount}`);
      params.push(entity_type);
    }

    if (search) {
      paramCount++;
      conditions.push(`(
        original_name ILIKE $${paramCount} OR
        description ILIKE $${paramCount} OR
        category ILIKE $${paramCount}
      )`);
      params.push(`%${search}%`);
    }

    const query = `
      WITH filtered_docs AS (
        SELECT *
        FROM documents
        WHERE ${conditions.join(' AND ')}
      )
      SELECT 
        filtered_docs.*,
        COUNT(*) OVER() as total_count
      FROM filtered_docs
      ORDER BY created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);
    
    res.json({
      documents: result.rows,
      total: result.rows.length ? parseInt(result.rows[0].total_count) : 0,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Search documents error:', error);
    res.status(500).json({ error: 'Failed to search documents' });
  }
});

// Get document categories (static route before parameterized routes)
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categories = [
      {
        type: 'vendor',
        categories: [
          'Brochures',
          'CSI SPEC',
          'Installation Guides',
          'Maintenance Guides',
          'SDS - Safety Data Sheets',
          'TDS - Technical Data Sheets'
        ]
      },
      {
        type: 'client',
        categories: [
          'Contract',
          'Proposal',
          'Invoice',
          'Communication',
          'Other'
        ]
      }
    ];
    res.json(categories);
  } catch (error) {
    console.error('Error fetching document categories:', error);
    res.status(500).json({ error: 'Failed to fetch document categories' });
  }
});

// Get documents for a specific vendor
router.get('/vendor/:id', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM documents
      WHERE entity_type = 'vendor'
      AND entity_id = $1
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [req.params.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Download document route
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM documents 
      WHERE id = $1 AND status = 'active'
    `;
    const result = await db.query(query, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = result.rows[0];
    
    res.download(document.file_path, document.original_name, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Failed to download document' });
      }
    });
  } catch (error) {
    console.error('Document download error:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Get documents for a specific entity type and ID

router.get('/:entityType/:entityId', authenticateToken, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const query = `
      SELECT * FROM documents
      WHERE entity_type = $1
      AND entity_id = $2
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [entityType, entityId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Upload document route
router.post('/:entityType/:entityId/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { entityType, entityId } = req.params;
    const { category, description, extracted_text } = req.body;

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
        description,
        extracted_text,
        status,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      entityType,
      parseInt(entityId, 10),
      req.file.filename,
      req.file.originalname,
      req.file.path,
      req.file.size,
      req.file.mimetype,
      category || null,
      description || null,
      extracted_text || null,
      'active'
    ];

    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get documents by entity type
router.get('/:entityType', authenticateToken, async (req, res) => {
  try {
    const { entityType } = req.params;
    const query = `
      SELECT * FROM documents
      WHERE entity_type = $1
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [entityType]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching documents by entity type:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Update document metadata
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { category, description } = req.body;

    const query = `
      UPDATE documents
      SET 
        category = COALESCE($2, category),
        description = COALESCE($3, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, [id, category, description]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Document update error:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Delete document route
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const findQuery = `
      SELECT * FROM documents 
      WHERE id = $1 AND status = 'active'
    `;
    const findResult = await db.query(findQuery, [req.params.id]);

    if (findResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = findResult.rows[0];

    const deleteQuery = `
      UPDATE documents 
      SET 
        status = 'deleted', 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const deleteResult = await db.query(deleteQuery, [req.params.id]);

    try {
      await fs.unlink(document.file_path);
    } catch (fileError) {
      console.warn('Failed to delete file:', fileError);
    }

    res.json(deleteResult.rows[0]);
  } catch (error) {
    console.error('Document delete error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router;