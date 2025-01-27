// src/services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

const authService = {
  async hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  async comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
  },

  async getUserPermissions(role) {
    try {
      const query = `
        SELECT permissions 
        FROM user_roles 
        WHERE name = $1
      `;
      const result = await db.query(query, [role]);
      
      return result.rows[0]?.permissions || {};
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return {};
    }
  },

  generateToken(user, permissions = {}) {
    return jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        permissions
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  },

  async login(email, password) {
    const query = `
      SELECT * FROM users 
      WHERE email = $1 AND status = 'active'`;
    
    const result = await db.query(query, [email]);
    const user = result.rows[0];

    if (!user || !(await this.comparePasswords(password, user.password_hash))) {
      throw new Error('Invalid credentials');
    }

    // Fetch user role permissions
    const permissions = await this.getUserPermissions(user.role);

    // Update last login
    await db.query(
      `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
      [user.id]
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      permissions,
      token: this.generateToken(user, permissions)
    };
  },

  async resetPassword(userId, newPassword) {
    const passwordHash = await this.hashPassword(newPassword);
    
    await db.query(
      `UPDATE users 
       SET password_hash = $1,
           reset_token = NULL,
           reset_token_expires = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [passwordHash, userId]
    );
  },

  async changePassword(userId, currentPassword, newPassword) {
    // Fetch user to verify current password
    const userQuery = 'SELECT password_hash FROM users WHERE id = $1';
    const userResult = await db.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.comparePasswords(
      currentPassword, 
      userResult.rows[0].password_hash
    );

    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash and update new password
    const newPasswordHash = await this.hashPassword(newPassword);
    
    await db.query(
      `UPDATE users 
       SET password_hash = $1, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [newPasswordHash, userId]
    );
  }
};

module.exports = authService;