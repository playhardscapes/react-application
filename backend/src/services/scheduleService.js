// src/services/scheduleService.js
const db = require('../config/database');

const scheduleService = {
  async getAllSchedules() {
    const query = `
      SELECT 
        ps.*,
        p.title as project_title,
        p.status as project_status
      FROM project_schedule ps
      JOIN projects p ON p.id = ps.project_id
      WHERE p.status != 'cancelled'
      ORDER BY ps.start_date ASC
    `;

    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error in getAllSchedules:', error);
      throw error;
    }
  },

  async getScheduleByProject(projectId) {
    const query = `
      SELECT 
        ps.*,
        p.title as project_title
      FROM project_schedule ps
      JOIN projects p ON p.id = ps.project_id
      WHERE ps.project_id = $1
      ORDER BY ps.start_date ASC
    `;

    try {
      const result = await db.query(query, [projectId]);
      return result.rows;
    } catch (error) {
      console.error('Error in getScheduleByProject:', error);
      throw error;
    }
  },

  async createSchedule(scheduleData) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Validate date range
      if (new Date(scheduleData.end_date) < new Date(scheduleData.start_date)) {
        throw new Error('End date cannot be before start date');
      }

      // Check for schedule conflicts
      const conflictQuery = `
        SELECT * FROM project_schedule
        WHERE project_id = $1
        AND (
          (start_date <= $2 AND end_date >= $2)
          OR (start_date <= $3 AND end_date >= $3)
          OR (start_date >= $2 AND end_date <= $3)
        )
      `;

      const conflicts = await client.query(conflictQuery, [
        scheduleData.project_id,
        scheduleData.start_date,
        scheduleData.end_date
      ]);

      if (conflicts.rows.length > 0) {
        throw new Error('Schedule conflict detected');
      }

      // Insert new schedule
      const insertQuery = `
        INSERT INTO project_schedule (
          project_id,
          start_date,
          end_date,
          schedule_type,
          status,
          weather_dependent
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        scheduleData.project_id,
        scheduleData.start_date,
        scheduleData.end_date,
        scheduleData.schedule_type,
        scheduleData.status,
        scheduleData.weather_dependent
      ]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async updateScheduleStatus(scheduleId, status) {
    const query = `
      UPDATE project_schedule
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await db.query(query, [status, scheduleId]);
      if (result.rows.length === 0) {
        throw new Error('Schedule not found');
      }
      return result.rows[0];
    } catch (error) {
      console.error('Error in updateScheduleStatus:', error);
      throw error;
    }
  },

  async updateSchedule(scheduleId, scheduleData) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Get existing schedule
      const existingSchedule = await client.query(
        'SELECT * FROM project_schedule WHERE id = $1',
        [scheduleId]
      );

      if (existingSchedule.rows.length === 0) {
        throw new Error('Schedule not found');
      }

      const current = existingSchedule.rows[0];
      const startDate = scheduleData.start_date || current.start_date;
      const endDate = scheduleData.end_date || current.end_date;

      // Validate date range
      if (new Date(endDate) < new Date(startDate)) {
        throw new Error('End date cannot be before start date');
      }

      // Check for schedule conflicts
      const conflictQuery = `
        SELECT * FROM project_schedule
        WHERE project_id = $1
        AND id != $2
        AND (
          (start_date <= $3 AND end_date >= $3)
          OR (start_date <= $4 AND end_date >= $4)
          OR (start_date >= $3 AND end_date <= $4)
        )
      `;

      const conflicts = await client.query(conflictQuery, [
        current.project_id,
        scheduleId,
        startDate,
        endDate
      ]);

      if (conflicts.rows.length > 0) {
        throw new Error('Schedule conflict detected');
      }

      // Update schedule
      const updateQuery = `
        UPDATE project_schedule
        SET 
          start_date = COALESCE($1, start_date),
          end_date = COALESCE($2, end_date),
          schedule_type = COALESCE($3, schedule_type),
          status = COALESCE($4, status),
          weather_dependent = COALESCE($5, weather_dependent),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
      `;

      const result = await client.query(updateQuery, [
        scheduleData.start_date,
        scheduleData.end_date,
        scheduleData.schedule_type,
        scheduleData.status,
        scheduleData.weather_dependent,
        scheduleId
      ]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async deleteSchedule(scheduleId) {
    const query = 'DELETE FROM project_schedule WHERE id = $1 RETURNING id';

    try {
      const result = await db.query(query, [scheduleId]);
      if (result.rows.length === 0) {
        throw new Error('Schedule not found');
      }
      return result.rows[0];
    } catch (error) {
      console.error('Error in deleteSchedule:', error);
      throw error;
    }
  }
};

module.exports = scheduleService;