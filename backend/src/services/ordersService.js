// src/services/ordersService.js
const db = require('../config/database');

const ordersService = {
  /**
   * Create a new purchase order
   * @param {Object} orderData Purchase order details
   * @returns {Promise<Object>} Created purchase order
   */
  async createOrder(orderData) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Insert purchase order
      const orderQuery = `
        INSERT INTO purchase_orders (
          vendor_id, 
          order_number, 
          total_amount, 
          status, 
          expected_delivery, 
          notes
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      // Generate order number (you might want a more sophisticated method)
      const orderNumber = `PO-${Date.now()}`;

      const totalAmount = orderData.items.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice), 0);

      const orderValues = [
        orderData.vendorId,
        orderNumber,
        totalAmount,
        'pending', // default status
        orderData.expectedDelivery || null,
        orderData.notes || null
      ];

      const orderResult = await client.query(orderQuery, orderValues);
      const order = orderResult.rows[0];

      // Insert order items
      const itemQuery = `
        INSERT INTO purchase_order_items (
          purchase_order_id,
          material_id,
          quantity,
          unit_price,
          total_price,
          notes
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;

      for (const item of orderData.items) {
        await client.query(itemQuery, [
          order.id,
          item.materialId,
          item.quantity,
          item.unitPrice,
          item.quantity * item.unitPrice,
          item.notes || null
        ]);
      }

      await client.query('COMMIT');
      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating purchase order:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Get all purchase orders with optional filtering
   * @param {Object} filters Filtering options
   * @returns {Promise<Array>} List of purchase orders
   */
  async getAllOrders(filters = {}) {
    let query = `
      SELECT 
        po.id,
        po.order_number,
        po.total_amount,
        po.status,
        po.expected_delivery,
        v.name as vendor_name,
        (
          SELECT json_agg(
            json_build_object(
              'id', poi.id,
              'material_id', poi.material_id,
              'm_name', m.name,
              'quantity', poi.quantity,
              'unit_price', poi.unit_price,
              'unit', m.unit
            )
          )
          FROM purchase_order_items poi
          JOIN materials m ON poi.material_id = m.id
          WHERE poi.purchase_order_id = po.id
        ) as items
      FROM purchase_orders po
      JOIN vendors v ON po.vendor_id = v.id
      WHERE 1=1
    `;
  
    const values = [];
    let paramCount = 1;
  
    // Handle status filtering with proper array formatting
    if (filters.status) {
      let statusList;
      if (typeof filters.status === 'string') {
        statusList = filters.status.split(',').map(s => s.trim());
      } else if (Array.isArray(filters.status)) {
        statusList = filters.status;
      } else {
        statusList = [filters.status];
      }
      
      // Convert the array to a PostgreSQL array literal
      const statusArray = '{' + statusList.join(',') + '}';
      query += ` AND po.status = ANY($${paramCount}::text[])`;
      values.push(statusArray);
      paramCount++;
    }
  
    if (filters.vendorId) {
      query += ` AND po.vendor_id = $${paramCount}`;
      values.push(filters.vendorId);
      paramCount++;
    }
  
    query += ` ORDER BY po.created_at DESC`;
  
    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
      paramCount++;
    }

    console.log('Executing query:', {
      query,
      values,
      statusType: filters.status ? typeof filters.status : 'undefined'
    });
  
    const result = await db.query(query, values);
    return result.rows;
  },

  /**
   * Get a single purchase order by ID with its items
   * @param {number} id Purchase order ID
   * @returns {Promise<Object>} Purchase order details
   */
  async getOrderById(id) {
    const orderQuery = `
      SELECT 
        po.*,
        v.name as vendor_name,
        v.email as vendor_email
      FROM purchase_orders po
      JOIN vendors v ON po.vendor_id = v.id
      WHERE po.id = $1
    `;

    const itemsQuery = `
      SELECT 
        poi.*,
        m.name as material_name,
        m.sku as material_sku
      FROM purchase_order_items poi
      JOIN materials m ON poi.material_id = m.id
      WHERE poi.purchase_order_id = $1
    `;

    const [orderResult, itemsResult] = await Promise.all([
      db.query(orderQuery, [id]),
      db.query(itemsQuery, [id])
    ]);

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];
    order.items = itemsResult.rows;

    return order;
  },

  /**
   * Update purchase order status
   * @param {number} id Purchase order ID
   * @param {string} status New status
   * @returns {Promise<Object>} Updated purchase order
   */
  async updateOrderStatus(id, status) {
    const query = `
      UPDATE purchase_orders
      SET 
        status = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, [id, status]);
    
    if (result.rows.length === 0) {
      throw new Error('Purchase order not found');
    }

    return result.rows[0];
  },

  /**
   * Generate suggested purchase orders based on inventory levels
   * @returns {Promise<Array>} Suggested purchase orders
   */
  async getSuggestedOrders() {
    const query = `
      SELECT 
        m.id as material_id,
        m.name as material_name,
        m.min_quantity,
        m.reorder_quantity,
        COALESCE(SUM(ms.quantity), 0) as current_stock,
        m.reorder_quantity - COALESCE(SUM(ms.quantity), 0) as suggested_quantity
      FROM materials m
      LEFT JOIN material_stock ms ON m.id = ms.material_id
      GROUP BY m.id
      HAVING COALESCE(SUM(ms.quantity), 0) <= m.min_quantity
      ORDER BY suggested_quantity DESC
    `;

    const result = await db.query(query);
    return result.rows;
  },

   // Replace the entire getReceivedItems method with this new implementation
   async getReceivedItems(orderId) {
    console.log('Received request for order:', orderId);
    const query = `
      WITH received_quantities AS (
        SELECT 
          it.reference_id as poi_id,
          SUM(it.quantity) as received_quantity,
          it.location_id,
          MAX(it.transaction_date) as last_received_date
        FROM inventory_transactions it
        WHERE it.transaction_type = 'receive'
          AND it.reference_type = 'purchase_order_item'
        GROUP BY it.reference_id, it.location_id
      )
      SELECT 
        po.id AS purchase_order_id,
        po.order_number,
        po.vendor_id,
        poi.id AS order_item_id,
        poi.material_id,
        m.name AS material_name,
        m.sku AS material_sku,
        poi.quantity AS ordered_quantity,
        poi.unit_price,
        COALESCE(rq.received_quantity, 0) as received_quantity,
        ml.id as location_id,
        ml.name as location_name,
        rq.last_received_date as received_date
      FROM purchase_orders po
      JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
      JOIN materials m ON poi.material_id = m.id
      LEFT JOIN received_quantities rq ON rq.poi_id = poi.id
      LEFT JOIN material_locations ml ON rq.location_id = ml.id
      WHERE po.id = $1
      ORDER BY poi.id, rq.last_received_date DESC
    `;
  
    try {
      console.log('Fetching items for order ID:', orderId);
      const result = await db.query(query, [orderId]);
      
      // Group the results by order item
      const items = result.rows.reduce((acc, row) => {
        const itemId = row.order_item_id;
        if (!acc[itemId]) {
          acc[itemId] = {
            order_item_id: itemId,
            material_id: row.material_id,
            material_name: row.material_name,
            material_sku: row.material_sku,
            ordered_quantity: row.ordered_quantity,
            unit_price: row.unit_price,
            total_received: 0,
            receipts: []
          };
        }
        
        // Only add receipt information if there's a received quantity
        if (row.received_quantity > 0) {
          acc[itemId].receipts.push({
            quantity: row.received_quantity,
            location_id: row.location_id,
            location_name: row.location_name,
            received_date: row.received_date
          });
          acc[itemId].total_received += parseFloat(row.received_quantity);
        }
        
        return acc;
      }, {});
  
      console.log('Received items:', items);
      
      // Only return if we have items
      if (Object.keys(items).length === 0) {
        console.log('No items found for order');
        return null;
      }
  
      return {
        purchase_order_id: result.rows[0].purchase_order_id,
        order_number: result.rows[0].order_number,
        vendor_id: result.rows[0].vendor_id,
        items: Object.values(items)
      };
    } catch (error) {
      console.error('Error fetching received items:', error);
      throw error;
    }
  }
};

module.exports = ordersService;