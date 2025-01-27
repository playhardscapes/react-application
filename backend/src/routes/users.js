// src/routes/users.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

// Get all users
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT id, name, email, role, created_at, updated_at, last_login
      FROM users
      ORDER BY name`;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all roles
router.get('/roles', async (req, res) => {
  try {
    const query = `
      SELECT 
        id, 
        name, 
        description, 
        permissions 
      FROM user_roles 
      ORDER BY name`;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get team leads
router.get('/team-leads', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT u.id, u.name, u.email 
      FROM users u
      INNER JOIN project_team_members ptm ON u.id = ptm.user_id
      WHERE ptm.role = 'team_lead'
      ORDER BY u.name`;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching team leads:', error);
    res.status(500).json({ error: 'Failed to fetch team leads' });
  }
});

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const query = `
      SELECT id, name, email, role, created_at, updated_at
      FROM users
      WHERE id = $1`;
    const result = await db.query(query, [req.params.userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['admin', 'user', 'team_lead']).withMessage('Invalid role')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const query = `
      INSERT INTO users (name, email, role)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, role, created_at, updated_at`;
    
    const result = await db.query(query, [
      req.body.name,
      req.body.email,
      req.body.role || 'user'
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Invite new user route (add to existing users.js)
router.post('/invite', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['admin', 'user', 'team_lead']).withMessage('Invalid role')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if email already exists
    const existingUserCheck = await db.query(
      'SELECT id FROM users WHERE email = $1', 
      [req.body.email]
    );

    if (existingUserCheck.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Generate a temporary password or invitation token
    const temporaryPassword = Math.random().toString(36).slice(-8);

    // Insert invitation record
    const query = `
      INSERT INTO user_invitations (
        name, 
        email, 
        role, 
        token, 
        expires_at
      ) VALUES (
        $1, $2, $3, $4, CURRENT_TIMESTAMP + INTERVAL '24 hours'
      ) RETURNING *`;
    
    const invitationToken = require('crypto').randomBytes(32).toString('hex');
    
    const result = await db.query(query, [
      req.body.name,
      req.body.email,
      req.body.role || 'user',
      invitationToken
    ]);

    // TODO: Send email with invitation link
    // This would typically involve:
    // 1. Constructing an invitation URL with the token
    // 2. Sending an email via a service like SendGrid, Nodemailer, etc.
    // Example (pseudo-code):
    // await sendInvitationEmail({
    //   to: req.body.email,
    //   name: req.body.name,
    //   invitationLink: `${process.env.FRONTEND_URL}/accept-invitation/${invitationToken}`
    // });

    res.status(201).json({ 
      message: 'Invitation created successfully',
      invitationId: result.rows[0].id
    });
  } catch (error) {
    console.error('Error creating user invitation:', error);
    res.status(500).json({ error: 'Failed to create user invitation' });
  }
});

// Update user
router.put('/:id', [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['admin', 'user', 'team_lead']).withMessage('Invalid role')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updateFields = [];
    const values = [];
    let valueCount = 1;

    if (req.body.name !== undefined) {
      updateFields.push(`name = $${valueCount}`);
      values.push(req.body.name);
      valueCount++;
    }
    if (req.body.email !== undefined) {
      updateFields.push(`email = $${valueCount}`);
      values.push(req.body.email);
      valueCount++;
    }
    if (req.body.role !== undefined) {
      updateFields.push(`role = $${valueCount}`);
      values.push(req.body.role);
      valueCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id);
    const query = `
      UPDATE users
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${valueCount}
      RETURNING id, name, email, role, created_at, updated_at`;
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get all user roles
router.get('/roles', async (req, res) => {
    try {
      const query = `
        SELECT 
          id, 
          name, 
          description, 
          permissions 
        FROM user_roles 
        ORDER BY name`;
      
      const result = await db.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  });
  
  // Create a new role
  router.post('/roles', [
    body('name').trim().notEmpty().withMessage('Role name is required'),
    body('description').optional().trim(),
    body('permissions').optional().isArray().withMessage('Permissions must be an array')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const { name, description, permissions = [] } = req.body;
      
      const query = `
        INSERT INTO user_roles (name, description, permissions)
        VALUES ($1, $2, $3)
        RETURNING *`;
      
      const result = await db.query(query, [
        name, 
        description || null, 
        JSON.stringify(permissions)
      ]);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating role:', error);
      res.status(500).json({ error: 'Failed to create role' });
    }
  });
  
  // Update a role
  router.put('/roles/:id', [
    body('name').optional().trim().notEmpty().withMessage('Role name cannot be empty'),
    body('description').optional().trim(),
    body('permissions').optional().isArray().withMessage('Permissions must be an array')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const { name, description, permissions } = req.body;
      const updateFields = [];
      const values = [];
      let valueCount = 1;
  
      if (name !== undefined) {
        updateFields.push(`name = $${valueCount}`);
        values.push(name);
        valueCount++;
      }
  
      if (description !== undefined) {
        updateFields.push(`description = $${valueCount}`);
        values.push(description);
        valueCount++;
      }
  
      if (permissions !== undefined) {
        updateFields.push(`permissions = $${valueCount}`);
        values.push(JSON.stringify(permissions));
        valueCount++;
      }
  
      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
  
      values.push(req.params.id);
      const query = `
        UPDATE user_roles
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${valueCount}
        RETURNING *`;
      
      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Role not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating role:', error);
      res.status(500).json({ error: 'Failed to update role' });
    }
  });
  
  // Delete a role
  router.delete('/roles/:id', async (req, res) => {
    try {
      // First, check if the role is in use
      const checkUsageQuery = `
        SELECT COUNT(*) as user_count 
        FROM users 
        WHERE role = (SELECT name FROM user_roles WHERE id = $1)
      `;
      const usageResult = await db.query(checkUsageQuery, [req.params.id]);
      
      if (parseInt(usageResult.rows[0].user_count) > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete role. It is currently assigned to users.' 
        });
      }
  
      // If no users have this role, proceed with deletion
      const deleteQuery = `
        DELETE FROM user_roles 
        WHERE id = $1 
        RETURNING *`;
      
      const result = await db.query(deleteQuery, [req.params.id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Role not found' });
      }
      
      res.json({ message: 'Role deleted successfully' });
    } catch (error) {
      console.error('Error deleting role:', error);
      res.status(500).json({ error: 'Failed to delete role' });
    }
  });
  
  // Check if user can be deleted
router.get('/:id/check', async (req, res) => {
    try {
      // Check if the user has any active references (projects, tasks, etc.)
      const checkReferencesQuery = `
        SELECT 
          (SELECT COUNT(*) FROM project_team_members WHERE user_id = $1) +
          (SELECT COUNT(*) FROM tasks WHERE assigned_to = $1) AS reference_count
      `;
      
      const referencesResult = await db.query(checkReferencesQuery, [req.params.id]);
      
      if (parseInt(referencesResult.rows[0].reference_count) > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete user. They have active project or task assignments.' 
        });
      }
  
      res.json({ canDelete: true });
    } catch (error) {
      console.error('Error checking user references:', error);
      res.status(500).json({ error: 'Failed to check user references' });
    }
  });
  
  // Delete a user
  router.delete('/:id', async (req, res) => {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
  
      // First check if the user exists
      const userCheck = await client.query(
        'SELECT id FROM users WHERE id = $1',
        [req.params.id]
      );
  
      if (userCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Delete user's related records first (if any)
      await client.query(
        'DELETE FROM user_preferences WHERE user_id = $1',
        [req.params.id]
      );
  
      // Finally delete the user
      const result = await client.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [req.params.id]
      );
  
      await client.query('COMMIT');
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    } finally {
      client.release();
    }
  });
  
  module.exports = router;