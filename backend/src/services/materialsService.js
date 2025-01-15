// src/services/materialsService.js
const db = require('../config/database');

const materialsService = {
  // Get all materials with current stock levels
  async getAllMaterials() {
    const query = `
      SELECT 
        m.*,
        COALESCE(SUM(ms.quantity), 0) as total_quantity
      FROM materials m
      LEFT JOIN material_stock ms ON m.id = ms.material_id
      GROUP BY m.id
      ORDER BY m.name
    `;
    const result = await db.query(query);
    return result.rows;
  },

  // Get stock levels by location
  async getStockByLocation() {
    const query = `
      SELECT 
        m.*,
        ms.quantity,
        ms.location_id,
        ml.name as location_name,
        m.min_quantity,
        CASE 
          WHEN ms.quantity <= m.min_quantity THEN true 
          ELSE false 
        END as needs_reorder
      FROM materials m
      JOIN material_stock ms ON m.id = ms.material_id
      JOIN material_locations ml ON ms.location_id = ml.id
      ORDER BY m.category, m.name
    `;
    const result = await db.query(query);
    return result.rows;
  },

  // Get materials that need reordering
  async getReorderNeeded() {
    const query = `
      SELECT 
        m.*,
        COALESCE(SUM(ms.quantity), 0) as total_quantity
      FROM materials m
      LEFT JOIN material_stock ms ON m.id = ms.material_id
      GROUP BY m.id
      HAVING COALESCE(SUM(ms.quantity), 0) <= m.min_quantity
    `;
    const result = await db.query(query);
    return result.rows;
  },

  // Record material receipt
  async receiveMaterials(data) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Record the transaction
      const transactionQuery = `
        INSERT INTO inventory_transactions (
          material_id,
          transaction_type,
          quantity,
          unit_price,
          vendor_id,
          batch_number,
          notes
        ) VALUES ($1, 'receive', $2, $3, $4, $5, $6)
        RETURNING id
      `;
      const transactionValues = [
        data.materialId,
        data.quantity,
        data.unitPrice,
        data.vendorId,
        data.batchNumber,
        data.notes
      ];
      const transactionResult = await client.query(transactionQuery, transactionValues);

      // Update stock level
      const stockQuery = `
        INSERT INTO material_stock (material_id, location_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (material_id, location_id)
        DO UPDATE SET 
          quantity = material_stock.quantity + $3,
          updated_at = CURRENT_TIMESTAMP
      `;
      const stockValues = [data.materialId, data.locationId, data.quantity];
      await client.query(stockQuery, stockValues);

      await client.query('COMMIT');
      return transactionResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Record material usage
  async recordUsage(data) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Check if enough stock is available
      const stockQuery = `
        SELECT quantity 
        FROM material_stock 
        WHERE material_id = $1 AND location_id = $2
      `;
      const stockResult = await client.query(stockQuery, [data.materialId, data.locationId]);
      const currentStock = stockResult.rows[0]?.quantity || 0;

      if (currentStock < data.quantity) {
        throw new Error('Insufficient stock available');
      }

      // Record the transaction
      const transactionQuery = `
        INSERT INTO inventory_transactions (
          material_id,
          transaction_type,
          quantity,
          project_id,
          notes
        ) VALUES ($1, 'use', $2, $3, $4)
        RETURNING id
      `;
      const transactionValues = [
        data.materialId,
        data.quantity,
        data.projectId,
        data.notes
      ];
      const transactionResult = await client.query(transactionQuery, transactionValues);

      // Update stock level
      const updateStockQuery = `
        UPDATE material_stock 
        SET 
          quantity = quantity - $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE material_id = $1 AND location_id = $2
      `;
      const updateStockValues = [data.materialId, data.locationId, data.quantity];
      await client.query(updateStockQuery, updateStockValues);

      // Update project material usage
      const usageQuery = `
        INSERT INTO project_material_estimates (
          project_id,
          material_id,
          actual_quantity
        ) VALUES ($1, $2, $3)
        ON CONFLICT (project_id, material_id)
        DO UPDATE SET 
          actual_quantity = project_material_estimates.actual_quantity + $3,
          updated_at = CURRENT_TIMESTAMP
      `;
      const usageValues = [data.projectId, data.materialId, data.quantity];
      await client.query(usageQuery, usageValues);

      await client.query('COMMIT');
      return transactionResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Get material usage history by project
  async getProjectMaterialUsage(projectId) {
    const query = `
      SELECT 
        m.name,
        m.unit,
        pme.estimated_quantity,
        pme.actual_quantity,
        COALESCE(SUM(it.unit_price * it.quantity) / SUM(it.quantity), 0) as avg_unit_cost
      FROM project_material_estimates pme
      JOIN materials m ON pme.material_id = m.id
      LEFT JOIN inventory_transactions it ON m.id = it.material_id
      WHERE pme.project_id = $1
      GROUP BY m.id, m.name, m.unit, pme.estimated_quantity, pme.actual_quantity
    `;
    const result = await db.query(query, [projectId]);
    return result.rows;
  }
};

module.exports = materialsService;