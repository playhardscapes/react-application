// src/services/schedulingService.js
const db = require('../config/database');

const schedulingService = {
  /**
   * Create a new project schedule
   * @param {Object} scheduleData Schedule details
   * @returns {Promise<Object>} Created schedule
   */
  async createSchedule(scheduleData) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Insert main schedule
      const scheduleQuery = `
        INSERT INTO project_schedule (
          project_id, start_date, end_date, schedule_type,
          status, weather_dependent
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const scheduleResult = await client.query(scheduleQuery, [
        scheduleData.project_id,
        scheduleData.start_date,
        scheduleData.end_date,
        scheduleData.schedule_type || 'planned',
        scheduleData.status || 'pending',
        scheduleData.weather_dependent || false
      ]);

      // Create resource allocations if provided
      if (scheduleData.resources && scheduleData.resources.length > 0) {
        const allocationsQuery = `
          INSERT INTO resource_allocation (
            project_id, resource_type, resource_id,
            quantity, start_date, end_date
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `;

        for (const resource of scheduleData.resources) {
          await client.query(allocationsQuery, [
            scheduleData.project_id,
            resource.type,
            resource.id,
            resource.quantity,
            scheduleData.start_date,
            scheduleData.end_date
          ]);
        }
      }

      await client.query('COMMIT');
      return scheduleResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Check for schedule conflicts
   * @param {Date} startDate Start date
   * @param {Date} endDate End date
   * @param {Object} resources Required resources
   * @returns {Promise<Array>} List of conflicts
   */
  async checkScheduleConflicts(startDate, endDate, resources) {
    const query = `
      SELECT 
        ra.*, 
        p.title as project_title
      FROM resource_allocation ra
      JOIN projects p ON ra.project_id = p.id
      WHERE
        (ra.start_date, ra.end_date) OVERLAPS ($1::date, $2::date)
        AND ra.resource_id = ANY($3)
        AND ra.status IN ('planned', 'allocated', 'in_use')
    `;

    const resourceIds = resources.map(r => r.id);
    const conflicts = await db.query(query, [startDate, endDate, resourceIds]);
    return conflicts.rows;
  },

  /**
   * Get weather forecast for project location
   * @param {number} locationId Location ID
   * @param {Date} startDate Start date
   * @param {Date} endDate End date
   * @returns {Promise<Array>} Weather data
   */
  async getWeatherData(locationId, startDate, endDate) {
    const query = `
      SELECT *
      FROM weather_data
      WHERE location_id = $1
      AND date BETWEEN $2 AND $3
      ORDER BY date
    `;

    const result = await db.query(query, [locationId, startDate, endDate]);
    return result.rows;
  },

  /**
   * Update project schedule
   * @param {number} scheduleId Schedule ID
   * @param {Object} updates Schedule updates
   * @returns {Promise<Object>} Updated schedule
   */
  async updateSchedule(scheduleId, updates) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Update main schedule
      const scheduleQuery = `
        UPDATE project_schedule
        SET 
          start_date = COALESCE($2, start_date),
          end_date = COALESCE($3, end_date),
          status = COALESCE($4, status),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      const scheduleResult = await client.query(scheduleQuery, [
        scheduleId,
        updates.start_date,
        updates.end_date,
        updates.status
      ]);

      // Update resource allocations if provided
      if (updates.resources) {
        // First, remove existing allocations
        await client.query(
          'DELETE FROM resource_allocation WHERE project_id = $1',
          [scheduleResult.rows[0].project_id]
        );

        // Then insert new allocations
        const allocationsQuery = `
          INSERT INTO resource_allocation (
            project_id, resource_type, resource_id,
            quantity, start_date, end_date
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `;

        for (const resource of updates.resources) {
          await client.query(allocationsQuery, [
            scheduleResult.rows[0].project_id,
            resource.type,
            resource.id,
            resource.quantity,
            updates.start_date || scheduleResult.rows[0].start_date,
            updates.end_date || scheduleResult.rows[0].end_date
          ]);
        }
      }

      await client.query('COMMIT');
      return scheduleResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Create payment schedule for contract
   * @param {number} contractId Contract ID
   * @param {Array} payments Payment schedule details
   * @returns {Promise<Array>} Created payment schedules
   */
  async createPaymentSchedule(contractId, payments) {
    const query = `
      INSERT INTO payment_schedules (
        contract_id, payment_number, amount,
        due_date, payment_type, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const createdPayments = [];
    for (const [index, payment] of payments.entries()) {
      const result = await db.query(query, [
        contractId,
        index + 1,
        payment.amount,
        payment.due_date,
        payment.payment_type,
        payment.notes
      ]);
      createdPayments.push(result.rows[0]);
    }

    return createdPayments;
  },

  /**
   * Update payment schedule status
   * @param {number} paymentId Payment schedule ID
   * @param {string} status New status
   * @returns {Promise<Object>} Updated payment schedule
   */
  async updatePaymentStatus(paymentId, status) {
    const query = `
      UPDATE payment_schedules
      SET status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, [paymentId, status]);
    return result.rows[0];
  }
};

module.exports = schedulingService;