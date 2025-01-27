// src/middleware/permissionMiddleware.js
const db = require('../config/database');

/**
 * Middleware to check user permissions
 * @param {string} resource - The resource to check (e.g., 'projects', 'users')
 * @param {string|string[]} actions - Permitted action(s) (e.g., 'view', 'create')
 * @returns {Function} Express middleware function
 */
const checkPermission = (resource, actions) => {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Fetch user's role permissions
      const query = `
        SELECT permissions 
        FROM user_roles 
        WHERE name = $1
      `;
      const result = await db.query(query, [req.user.role]);
      
      if (result.rows.length === 0) {
        return res.status(403).json({ message: 'Role not found' });
      }

      const rolePermissions = result.rows[0].permissions;

      // Convert actions to array if it's a string
      const actionList = Array.isArray(actions) ? actions : [actions];

      // Check if the role has all required permissions
      const hasPermission = actionList.every(action => 
        rolePermissions[resource]?.includes(action)
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          message: 'Insufficient permissions',
          requiredPermissions: {
            resource,
            actions: actionList
          }
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Internal server error during permission check' });
    }
  };
};

module.exports = checkPermission;