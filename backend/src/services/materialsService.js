// src/services/materialsService.js
const db = require('../config/database');

const materialsService = {
  /**
   * Get all materials with current stock levels and location details
   */
  async getAllMaterials() {
    const query = `
      SELECT 
        m.*,
        COALESCE(SUM(ms.quantity), 0) as total_stock,
        json_agg(
          json_build_object(
            'location_id', ms.location_id,
            'location_name', ml.name,
            'quantity', ms.quantity
          )
        ) as stock_by_location
      FROM materials m
      LEFT JOIN material_stock ms ON m.id = ms.material_id
      LEFT JOIN material_locations ml ON ms.location_id = ml.id
      GROUP BY m.id
      ORDER BY m.name
    `;
    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching all materials:', error);
      throw error;
    }
  },

  /**
   * Get material locations
   */
  async getMaterialLocations() {
    const query = `
      SELECT 
        id, 
        name, 
        address, 
        notes
      FROM material_locations
      ORDER BY name
    `;
    
    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching material locations:', error);
      throw error;
    }
  },

  /**
   * Get stock levels by location with detailed material information
   */
  async getStockByLocation() {
    const query = `
      SELECT 
        ml.id as location_id,
        ml.name as location_name,
        json_agg(
          json_build_object(
            'material_id', m.id,
            'material_name', m.name,
            'quantity', COALESCE(ms.quantity, 0),
            'unit', m.unit,
            'min_quantity', m.min_quantity,
            'needs_reorder', CASE 
              WHEN COALESCE(ms.quantity, 0) <= m.min_quantity THEN true 
              ELSE false 
            END
          )
        ) FILTER (WHERE m.id IS NOT NULL) as materials
      FROM material_locations ml
      LEFT JOIN material_stock ms ON ml.id = ms.location_id
      LEFT JOIN materials m ON ms.material_id = m.id
      GROUP BY ml.id, ml.name
      ORDER BY ml.name
    `;
    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching stock by location:', error);
      throw error;
    }
  },

  /**
   * Get materials that need reordering with quantity needed
   */
  async getReorderNeeded() {
    const query = `
      SELECT 
        m.*,
        COALESCE(SUM(ms.quantity), 0) as current_stock,
        m.reorder_quantity - COALESCE(SUM(ms.quantity), 0) as quantity_needed
      FROM materials m
      LEFT JOIN material_stock ms ON m.id = ms.material_id
      GROUP BY m.id
      HAVING COALESCE(SUM(ms.quantity), 0) <= m.min_quantity
      ORDER BY quantity_needed DESC
    `;
    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching reorder needed:', error);
      throw error;
    }
  },

  /**
   * Record material receipt with vendor and batch tracking
   */
  async receiveMaterials(receiptData) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Handle both single receipt and batch receipts from PO
      const transactions = Array.isArray(receiptData.transactions) 
        ? receiptData.transactions 
        : [{
            materialId: receiptData.materialId,
            locationId: receiptData.locationId,
            quantity: receiptData.quantity,
            unitPrice: receiptData.unitPrice,
            vendorId: receiptData.vendorId,
            batchNumber: receiptData.batchNumber,
            notes: receiptData.notes
          }];

      for (const transaction of transactions) {
        // Record the inventory transaction
        const transactionQuery = `
          INSERT INTO inventory_transactions (
            material_id,
            location_id,
            transaction_type,
            quantity,
            unit_price,
            vendor_id,
            batch_number,
            reference_type,
            reference_id,
            notes
          ) VALUES ($1, $2, 'receive', $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `;

        const transactionValues = [
          transaction.materialId,
          transaction.locationId,
          transaction.quantity,
          transaction.unitPrice,
          transaction.vendorId,
          transaction.batchNumber,
          transaction.purchaseOrderItemId ? 'purchase_order_item' : null,
          transaction.purchaseOrderItemId || null,
          transaction.notes || 'Material received'
        ];

        await client.query(transactionQuery, transactionValues);

        // Update stock levels
        const stockQuery = `
          INSERT INTO material_stock (material_id, location_id, quantity)
          VALUES ($1, $2, $3)
          ON CONFLICT (material_id, location_id)
          DO UPDATE SET 
            quantity = material_stock.quantity + $3,
            updated_at = CURRENT_TIMESTAMP
        `;

        await client.query(stockQuery, [
          transaction.materialId,
          transaction.locationId,
          transaction.quantity
        ]);
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error receiving materials:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Record material usage with project tracking
   */
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
          location_id,
          transaction_type,
          quantity,
          project_id,
          notes
        ) VALUES ($1, $2, 'use', $3, $4, $5)
        RETURNING id
      `;
      const transactionValues = [
        data.materialId,
        data.locationId,
        data.quantity,
        data.projectId,
        data.notes || 'Material used in project'
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
      await client.query(updateStockQuery, [data.materialId, data.locationId, data.quantity]);

      // Update project material usage if project ID is provided
      if (data.projectId) {
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
        await client.query(usageQuery, [data.projectId, data.materialId, data.quantity]);
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
   * Get detailed material information by ID including stock levels
   */
  async getMaterialById(materialId) {
    const query = `
      SELECT 
        m.*,
        COALESCE(SUM(ms.quantity), 0) as total_quantity,
        json_agg(
          json_build_object(
            'id', ml.id,
            'name', ml.name,
            'quantity', COALESCE(ms.quantity, 0),
            'last_counted', ms.last_counted
          )
        ) FILTER (WHERE ml.id IS NOT NULL) as stock
      FROM materials m
      LEFT JOIN material_stock ms ON m.id = ms.material_id
      LEFT JOIN material_locations ml ON ms.location_id = ml.id
      WHERE m.id = $1
      GROUP BY m.id
    `;

    try {
      const result = await db.query(query, [materialId]);
      const material = result.rows[0] || null;
      
      // Ensure stock is an empty array if no stock exists
      if (material && !material.stock) {
        material.stock = [];
      }
      
      return material;
    } catch (error) {
      console.error('Error fetching material details:', error);
      throw error;
    }
  },

  /**
   * Get material transactions with detailed information
   */
  async getMaterialTransactions(materialId) {
    const query = `
      SELECT 
        it.*,
        ml.name as location_name,
        p.title as project_title,
        v.name as vendor_name
      FROM inventory_transactions it
      LEFT JOIN material_locations ml ON it.location_id = ml.id
      LEFT JOIN projects p ON it.project_id = p.id
      LEFT JOIN vendors v ON it.vendor_id = v.id
      WHERE it.material_id = $1
      ORDER BY it.transaction_date DESC
      LIMIT 50
    `;
    
    try {
      const result = await db.query(query, [materialId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching material transactions:', error);
      throw error;
    }
  },

  /**
   * Get material usage history by project with cost information
   */
  async getProjectMaterialUsage(projectId) {
    const query = `
      SELECT 
        m.name,
        m.unit,
        pme.estimated_quantity,
        pme.actual_quantity,
        COALESCE(SUM(it.unit_price * it.quantity) / NULLIF(SUM(it.quantity), 0), 0) as avg_unit_cost
      FROM project_material_estimates pme
      JOIN materials m ON pme.material_id = m.id
      LEFT JOIN inventory_transactions it ON m.id = it.material_id
      WHERE pme.project_id = $1
      GROUP BY m.id, m.name, m.unit, pme.estimated_quantity, pme.actual_quantity
    `;
    try {
      const result = await db.query(query, [projectId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching project material usage:', error);
      throw error;
    }
  }
};

module.exports = materialsService;