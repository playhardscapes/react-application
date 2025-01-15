// src/services/inventoryService.js
const db = require('../config/database');

const inventoryService = {
  /**
   * Add new material to inventory
   * @param {Object} materialData Material details
   * @returns {Promise<Object>} Created material
   */
  async addMaterial(materialData) {
    const query = `
      INSERT INTO materials (
        name, sku, category, unit, unit_size,
        min_quantity, reorder_quantity, notes,
        reorder_point, ideal_stock_level,
        manufacturer, unit_cost
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      materialData.name,
      materialData.sku,
      materialData.category,
      materialData.unit,
      materialData.unit_size,
      materialData.min_quantity,
      materialData.reorder_quantity,
      materialData.notes,
      materialData.reorder_point,
      materialData.ideal_stock_level,
      materialData.manufacturer,
      materialData.unit_cost
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  /**
   * Record inventory transaction (receive/use/adjust)
   * @param {Object} transactionData Transaction details
   * @returns {Promise<Object>} Created transaction
   */
  async recordTransaction(transactionData) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Record the transaction
      const transactionQuery = `
        INSERT INTO inventory_transactions (
          material_id, location_id, transaction_type,
          quantity, unit_price, project_id,
          batch_number, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const transactionResult = await client.query(transactionQuery, [
        transactionData.material_id,
        transactionData.location_id,
        transactionData.transaction_type,
        transactionData.quantity,
        transactionData.unit_price,
        transactionData.project_id,
        transactionData.batch_number,
        transactionData.notes
      ]);

      // Update stock levels
      const stockUpdateQuery = `
        INSERT INTO material_stock (material_id, location_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (material_id, location_id) DO UPDATE
        SET quantity = material_stock.quantity ${
          transactionData.transaction_type === 'receive' ? '+' : '-'
        } $3,
        updated_at = CURRENT_TIMESTAMP
      `;

      await client.query(stockUpdateQuery, [
        transactionData.material_id,
        transactionData.location_id,
        transactionData.quantity
      ]);

      // Record adjustment if needed
      if (transactionData.adjustment_reason) {
        const adjustmentQuery = `
          INSERT INTO inventory_adjustments (
            material_id, location_id, adjustment_type,
            quantity_change, reason, performed_by
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `;

        await client.query(adjustmentQuery, [
          transactionData.material_id,
          transactionData.location_id,
          'manual',
          transactionData.quantity,
          transactionData.adjustment_reason,
          transactionData.user_id
        ]);
      }

      await client.query('COMMIT');
      return transactionResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Get current stock levels
   * @param {Object} filters Optional filters
   * @returns {Promise<Array>} Stock levels
   */
  async getStockLevels(filters = {}) {
    let query = `
      SELECT 
        m.*,
        ml.name as location_name,
        ms.quantity as current_stock,
        ms.last_counted,
        CASE
          WHEN ms.quantity <= m.min_quantity THEN true
          ELSE false
        END as needs_reorder
      FROM materials m
      LEFT JOIN material_stock ms ON m.id = ms.material_id
      LEFT JOIN material_locations ml ON ms.location_id = ml.id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 1;

    if (filters.category) {
      query += ` AND m.category = $${paramCount}`;
      values.push(filters.category);
      paramCount++;
    }

    if (filters.location_id) {
      query += ` AND ml.id = $${paramCount}`;
      values.push(filters.location_id);
      paramCount++;
    }

    if (filters.needs_reorder === true) {
      query += ` AND ms.quantity <= m.min_quantity`;
    }

    query += ' ORDER BY m.category, m.name';

    const result = await db.query(query, values);
    return result.rows;
  },

  /**
   * Get material usage history
   * @param {number} materialId Material ID
   * @param {Object} filters Optional filters
   * @returns {Promise<Array>} Usage history
   */
  async getMaterialUsageHistory(materialId, filters = {}) {
    let query = `
      SELECT 
        it.*,
        p.title as project_title,
        ml.name as location_name,
        u.name as user_name
      FROM inventory_transactions it
      LEFT JOIN projects p ON it.project_id = p.id
      LEFT JOIN material_locations ml ON it.location_id = ml.id
      LEFT JOIN users u ON it.performed_by = u.id
      WHERE it.material_id = $1
    `;

    const values = [materialId];
    let paramCount = 2;

    if (filters.start_date) {
      query += ` AND it.created_at >= $${paramCount}`;
      values.push(filters.start_date);
      paramCount++;
    }

    if (filters.end_date) {
      query += ` AND it.created_at <= $${paramCount}`;
      values.push(filters.end_date);
      paramCount++;
    }

    query += ' ORDER BY it.created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    const result = await db.query(query, values);
    return result.rows;
  },

  /**
   * Generate reorder report
   * @returns {Promise<Array>} Items needing reorder
   */
  async generateReorderReport() {
    const query = `
      SELECT 
        m.*,
        SUM(ms.quantity) as total_stock,
        m.reorder_quantity as suggested_order_quantity,
        m.unit_cost * m.reorder_quantity as estimated_cost
      FROM materials m
      LEFT JOIN material_stock ms ON m.id = ms.material_id
      GROUP BY m.id
      HAVING COALESCE(SUM(ms.quantity), 0) <= m.min_quantity
      ORDER BY m.category, m.name
    `;

    const result = await db.query(query);
    return result.rows;
  },

  /**
   * Perform inventory count reconciliation
   * @param {Object} reconciliationData Reconciliation details
   * @returns {Promise<Object>} Reconciliation results
   */
  async performReconciliation(reconciliationData) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const { material_id, location_id, counted_quantity, user_id } = reconciliationData;

      // Get current stock level
      const stockQuery = `
        SELECT quantity 
        FROM material_stock 
        WHERE material_id = $1 AND location_id = $2
      `;
      const stockResult = await client.query(stockQuery, [material_id, location_id]);
      const currentQuantity = stockResult.rows[0]?.quantity || 0;

      // Calculate difference
      const difference = counted_quantity - currentQuantity;

      if (difference !== 0) {
        // Record adjustment
        const adjustmentQuery = `
          INSERT INTO inventory_adjustments (
            material_id, location_id, adjustment_type,
            quantity_change, reason, performed_by
          ) VALUES ($1, $2, 'reconciliation', $3, $4, $5)
        `;
        await client.query(adjustmentQuery, [
          material_id,
          location_id,
          difference,
          'Inventory count reconciliation',
          user_id
        ]);

        // Update stock level
        const updateQuery = `
          UPDATE material_stock
          SET 
            quantity = $3,
            last_counted = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
          WHERE material_id = $1 AND location_id = $2
        `;
        await client.query(updateQuery, [
          material_id,
          location_id,
          counted_quantity
        ]);
      }

      await client.query('COMMIT');

      return {
        material_id,
        location_id,
        previous_quantity: currentQuantity,
        new_quantity: counted_quantity,
        difference,
        reconciliation_date: new Date()
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = inventoryService;