// src/services/timeEntryService.js
const db = require('../config/database');

const timeEntryService = {
  /**
   * Create a new time entry
   * @param {Object} timeEntryData - Time entry details
   * @returns {Promise<Object>} Created time entry
   */
  async createTimeEntry(timeEntryData) {
    const {
      user_id,
      project_id,
      date,
      hours,
      description = '',
      billable = true,
      status = 'completed'
    } = timeEntryData;

    const query = `
      INSERT INTO time_entries (
        user_id,
        project_id,
        date,
        hours,
        description,
        billable,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      user_id,
      project_id,
      date,
      hours,
      description,
      billable,
      status
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating time entry:', error);
      throw error;
    }
  },

  /**
   * Get a specific time entry by ID
   * @param {number} id - Time entry ID
   * @returns {Promise<Object>} Time entry details
   */
  async getTimeEntryById(id) {
    const query = `
      SELECT 
        te.*,
        u.name as user_name,
        p.title as project_title
      FROM time_entries te
      LEFT JOIN users u ON te.user_id = u.id
      LEFT JOIN projects p ON te.project_id = p.id
      WHERE te.id = $1
    `;

    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching time entry:', error);
      throw error;
    }
  },

  /**
   * Update an existing time entry
   * @param {number} id - Time entry ID
   * @param {Object} timeEntryData - Updated time entry details
   * @returns {Promise<Object>} Updated time entry
   */
  async updateTimeEntry(id, timeEntryData) {
    const {
      project_id,
      date,
      hours,
      description,
      billable,
      status
    } = timeEntryData;

    const query = `
      UPDATE time_entries
      SET 
        project_id = COALESCE($2, project_id),
        date = COALESCE($3, date),
        hours = COALESCE($4, hours),
        description = COALESCE($5, description),
        billable = COALESCE($6, billable),
        status = COALESCE($7, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      project_id,
      date,
      hours,
      description,
      billable,
      status
    ];

    try {
      const result = await db.query(query, values);
      if (result.rows.length === 0) {
        throw new Error('Time entry not found');
      }
      return result.rows[0];
    } catch (error) {
      console.error('Error updating time entry:', error);
      throw error;
    }
  },

  /**
   * List time entries with optional filtering
   * @param {Object} filters - Filtering and pagination options
   * @returns {Promise<Array>} List of time entries
   */
  async listTimeEntries(filters = {}) {
    const { 
      user_id, 
      project_id, 
      start_date, 
      end_date, 
      billable,
      status,
      page = 1, 
      limit = 50 
    } = filters;

    let query = `
      SELECT 
        te.*,
        u.name as user_name,
        p.title as project_title
      FROM time_entries te
      LEFT JOIN users u ON te.user_id = u.id
      LEFT JOIN projects p ON te.project_id = p.id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 1;

    if (user_id) {
      query += ` AND te.user_id = $${paramCount}`;
      values.push(user_id);
      paramCount++;
    }

    if (project_id) {
      query += ` AND te.project_id = $${paramCount}`;
      values.push(project_id);
      paramCount++;
    }

    if (start_date) {
      query += ` AND te.date >= $${paramCount}`;
      values.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND te.date <= $${paramCount}`;
      values.push(end_date);
      paramCount++;
    }

    if (billable !== undefined) {
      query += ` AND te.billable = $${paramCount}`;
      values.push(billable);
      paramCount++;
    }

    if (status) {
      query += ` AND te.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    // Add sorting and pagination
    query += ` ORDER BY te.date DESC, te.created_at DESC 
               LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, (page - 1) * limit);

    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error listing time entries:', error);
      throw error;
    }
  },

  /**
   * Delete a time entry
   * @param {number} id - Time entry ID to delete
   * @returns {Promise<boolean>} Deletion success
   */
  async deleteTimeEntry(id) {
    const query = 'DELETE FROM time_entries WHERE id = $1 RETURNING id';

    try {
      const result = await db.query(query, [id]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting time entry:', error);
      throw error;
    }
  },

  /**
   * Calculate total billable hours for a user or project
   * @param {Object} filters - Filtering options
   * @returns {Promise<number>} Total billable hours
   */
  async calculateBillableHours(filters = {}) {
    const { 
      user_id, 
      project_id, 
      start_date, 
      end_date 
    } = filters;

    let query = `
      SELECT COALESCE(SUM(hours), 0) as total_billable_hours
      FROM time_entries
      WHERE billable = true
    `;

    const values = [];
    let paramCount = 1;

    if (user_id) {
      query += ` AND user_id = $${paramCount}`;
      values.push(user_id);
      paramCount++;
    }

    if (project_id) {
      query += ` AND project_id = $${paramCount}`;
      values.push(project_id);
      paramCount++;
    }

    if (start_date) {
      query += ` AND date >= $${paramCount}`;
      values.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND date <= $${paramCount}`;
      values.push(end_date);
      paramCount++;
    }

    try {
      const result = await db.query(query, values);
      return parseFloat(result.rows[0].total_billable_hours);
    } catch (error) {
      console.error('Error calculating billable hours:', error);
      throw error;
    }
  }
};

module.exports = timeEntryService;