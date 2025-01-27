// src/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const authService = require('../services/authService');
const checkPermission = require('../middleware/permissionMiddleware');

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = '24h';

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const loginResult = await authService.login(email, password);
    
    res.json(loginResult);
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: error.message });
  }
});

// Verification endpoint
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    // Fetch fresh user data and permissions
    const userQuery = `
      SELECT id, name, email, role 
      FROM users 
      WHERE id = $1
    `;
    const userResult = await db.query(userQuery, [req.user.id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    const permissions = await authService.getUserPermissions(user.role);

    res.status(200).json({ 
      message: 'Token is valid',
      user,
      permissions
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user endpoint
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT id, name, email, role 
      FROM users 
      WHERE id = $1
    `;
    const result = await db.query(query, [req.user.id]);
    
    if (!result.rows[0]) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    const permissions = await authService.getUserPermissions(user.role);

    res.json({ 
      ...user, 
      permissions 
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Change password endpoint
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate password length
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        message: 'New password must be at least 8 characters long' 
      });
    }

    await authService.changePassword(
      req.user.id, 
      currentPassword, 
      newPassword
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  });
}

// Token refresh endpoint
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Fetch user details to regenerate token with latest permissions
    const userQuery = `
      SELECT id, name, email, role 
      FROM users 
      WHERE id = $1
    `;
    const userResult = await db.query(userQuery, [req.user.id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    const permissions = await authService.getUserPermissions(user.role);

    // Create new token with updated permissions
    const token = authService.generateToken(user, permissions);

    res.json({ token, user, permissions });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// First login endpoint (for initial admin login)
router.post('/first-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user from database
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Specific check for first login
    if (email === 'patrick@playhardscapes.com' && user.last_login === null) {
      // Check password for first login
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Fetch user role permissions
      const permissions = await authService.getUserPermissions(user.role);

      // Create token with special first-login flag
      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          role: user.role,
          permissions,
          isFirstLogin: true
        },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );

      // Remove sensitive data before sending
      delete user.password_hash;

      return res.json({
        user,
        token,
        permissions,
        isFirstLogin: true
      });
    }

    // If not first login, use standard login logic
    return res.status(401).json({ message: 'Invalid first-time login attempt' });
  } catch (error) {
    console.error('First login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;