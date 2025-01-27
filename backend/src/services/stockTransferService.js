// src/services/stockTransferService.js
const db = require('../config/database');

class StockTransferService {
  async createTransfer({ materialId, fromLocationId, toLocationId, quantity }) {
    try {
      await db.query('BEGIN');
      
      // Verify sufficient stock at source location
      const sourceStockQuery = `
        SELECT quantity 
        FROM material_stock 
        WHERE material_id = $1 AND location_id = $2
      `;
      const sourceStock = await db.query(sourceStockQuery, [materialId, fromLocationId]);
      
      if (sourceStock.rows.length === 0 || sourceStock.rows[0].quantity < quantity) {
        throw new Error('Insufficient stock at source location');
      }

      // Create transfer record
      const transferQuery = `
        INSERT INTO stock_transfers (
          material_id,
          from_location_id,
          to_location_id,
          quantity
        ) VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const transfer = await db.query(transferQuery, [
        materialId,
        fromLocationId,
        toLocationId,
        quantity
      ]);

      // Decrease stock at source location
      const decreaseStockQuery = `
        UPDATE material_stock
        SET quantity = quantity - $1
        WHERE material_id = $2 AND location_id = $3
      `;
      
      await db.query(decreaseStockQuery, [quantity, materialId, fromLocationId]);

      // Increase stock at destination location (or create new stock record)
      const upsertStockQuery = `
        INSERT INTO material_stock (material_id, location_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (material_id, location_id)
        DO UPDATE SET quantity = material_stock.quantity + EXCLUDED.quantity
      `;
      
      await db.query(upsertStockQuery, [materialId, toLocationId, quantity]);

      await db.query('COMMIT');
      return transfer.rows[0];
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }
}

module.exports = new StockTransferService();