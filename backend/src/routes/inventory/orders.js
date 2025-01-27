// src/routes/inventory/orders.js
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const db = require('../../config/database');
const { validate } = require('../../middleware/validation');
const MicrosoftGraphEmailService = require('../../services/microsoftGraphService');

const generatePurchaseOrderEmail = (order, vendorName) => {
    // Helper function to format numbers safely
    const formatCurrency = (value) => {
      const num = parseFloat(value);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    };
  
    const itemsHtml = (order.items || []).map(item => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.material_name}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(item.quantity)}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">$${formatCurrency(item.unit_price)}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">$${formatCurrency(item.quantity * item.unit_price)}</td>
      </tr>
    `).join('');
  
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2>Purchase Order #${order.order_number}</h2>
        <p>Dear ${vendorName},</p>
        <p>Please find our purchase order details below:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 8px; border: 1px solid #ddd;">Material</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Unit Price</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right; padding: 8px; border: 1px solid #ddd;"><strong>Total Amount:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">$${formatCurrency(order.total_amount)}</td>
            </tr>
          </tfoot>
        </table>
  
        ${order.notes ? `<p><strong>Additional Notes:</strong><br>${order.notes}</p>` : ''}
        
        <p>Expected Delivery Date: ${new Date(order.expected_delivery).toLocaleDateString()}</p>
        
        <p>Please confirm receipt of this order and provide an estimated delivery date.</p>
        
        <p>Best regards,<br>Play Hardscapes</p>
      </div>
    `;
  };

// Get all purchase orders
router.get('/', async (req, res) => {
  try {
    const { status, vendorId, limit } = req.query;
    
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

    if (status) {
      query += ` AND po.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    if (vendorId) {
      query += ` AND po.vendor_id = $${paramCount}`;
      values.push(vendorId);
      paramCount++;
    }

    query += ` ORDER BY po.created_at DESC`;

    if (limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(parseInt(limit));
    }

    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch orders', 
      details: error.message 
    });
  }
});

// Create purchase order
router.post('/', validate([
  body('vendorId').isInt().notEmpty().withMessage('Vendor is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.materialId').isInt().withMessage('Valid material is required'),
  body('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be greater than or equal to 0'),
  body('status').optional().isIn(['draft', 'ordered']).withMessage('Invalid status')
]), async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

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

    const orderNumber = `PO-${Date.now()}`;
    const totalAmount = req.body.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0);

    const orderResult = await client.query(orderQuery, [
      req.body.vendorId,
      orderNumber,
      totalAmount,
      req.body.status || 'draft',  // Default to draft instead of pending
      req.body.expectedDelivery || null,
      req.body.notes || null
    ]);

    const order = orderResult.rows[0];

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

    for (const item of req.body.items) {
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

    // After commit, fetch the complete order with items
    const finalOrderQuery = `
      SELECT 
        po.*,
        v.name as vendor_name,
        v.email as vendor_email,
        (
          SELECT json_agg(
            json_build_object(
              'id', poi.id,
              'material_id', poi.material_id,
              'material_name', m.name,
              'material_sku', m.sku,
              'quantity', poi.quantity,
              'unit_price', poi.unit_price,
              'total_price', poi.total_price,
              'notes', poi.notes
            )
          )
          FROM purchase_order_items poi
          JOIN materials m ON poi.material_id = m.id
          WHERE poi.purchase_order_id = po.id
        ) as items
      FROM purchase_orders po
      JOIN vendors v ON po.vendor_id = v.id
      WHERE po.id = $1
    `;

    const finalResult = await db.query(finalOrderQuery, [order.id]);
    res.status(201).json(finalResult.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      details: error.message 
    });
  } finally {
    client.release();
  }
});

// Get single purchase order by ID
router.get('/:id', validate([
  param('id').isInt()
]), async (req, res) => {
  try {
    const query = `
      SELECT 
        po.*,
        v.name as vendor_name,
        v.email as vendor_email,
        (
          SELECT json_agg(
            json_build_object(
              'id', poi.id,
              'material_id', poi.material_id,
              'material_name', m.name,
              'material_sku', m.sku,
              'quantity', poi.quantity,
              'unit_price', poi.unit_price,
              'total_price', poi.total_price,
              'notes', poi.notes
            )
          )
          FROM purchase_order_items poi
          JOIN materials m ON poi.material_id = m.id
          WHERE poi.purchase_order_id = po.id
        ) as items
      FROM purchase_orders po
      JOIN vendors v ON po.vendor_id = v.id
      WHERE po.id = $1
    `;

    const result = await db.query(query, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update purchase order status
router.patch('/:id/status', validate([
  param('id').isInt(),
  body('status').isIn(['pending', 'approved', 'ordered', 'partially_received', 'received', 'cancelled'])
]), async (req, res) => {
  try {
    const query = `
      UPDATE purchase_orders
      SET 
        status = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, [req.params.id, req.body.status]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Update purchase order
router.put('/:id', validate([
  param('id').isInt(),
  body('vendorId').isInt(),
  body('items').isArray({ min: 1 }),
  body('items.*.materialId').isInt(),
  body('items.*.quantity').isFloat({ min: 0.01 }),
  body('items.*.unitPrice').isFloat({ min: 0 })
]), async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const totalAmount = req.body.items.reduce((sum, item) => 
      sum + (parseFloat(item.quantity) * parseFloat(item.unitPrice)), 0);

    const orderQuery = `
      UPDATE purchase_orders 
      SET 
        vendor_id = $1,
        expected_delivery = $2,
        total_amount = $3,
        notes = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const orderResult = await client.query(orderQuery, [
      req.body.vendorId,
      req.body.expectedDelivery || null,
      totalAmount,
      req.body.notes || null,
      req.params.id
    ]);

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    await client.query(
      'DELETE FROM purchase_order_items WHERE purchase_order_id = $1',
      [req.params.id]
    );

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

    for (const item of req.body.items) {
      const itemTotal = parseFloat(item.quantity) * parseFloat(item.unitPrice);
      await client.query(itemQuery, [
        req.params.id,
        item.materialId,
        item.quantity,
        item.unitPrice,
        itemTotal,
        item.notes || null
      ]);
    }

    await client.query('COMMIT');

    const updatedOrderQuery = `
      SELECT 
        po.*,
        v.name as vendor_name,
        v.email as vendor_email,
        (
          SELECT json_agg(
            json_build_object(
              'id', poi.id,
              'material_id', poi.material_id,
              'material_name', m.name,
              'material_sku', m.sku,
              'quantity', poi.quantity,
              'unit_price', poi.unit_price,
              'total_price', poi.total_price,
              'notes', poi.notes
            )
          )
          FROM purchase_order_items poi
          JOIN materials m ON poi.material_id = m.id
          WHERE poi.purchase_order_id = po.id
        ) as items
      FROM purchase_orders po
      JOIN vendors v ON po.vendor_id = v.id
      WHERE po.id = $1
    `;

    const finalResult = await db.query(updatedOrderQuery, [req.params.id]);
    res.json(finalResult.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order', details: error.message });
  } finally {
    client.release();
  }
});

// Add this route to your orders.js routes file
router.get('/:id/received-items', [
    param('id').isInt()
  ], validate, async (req, res) => {
    try {
      const items = await orderService.getReceivedItems(req.params.id);
      if (!items) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(items);
    } catch (error) {
      console.error('Error fetching received items:', error);
      res.status(500).json({ error: 'Failed to fetch received items' });
    }
  });

  router.post('/', validate([
    body('vendorId').isInt().notEmpty().withMessage('Vendor is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.materialId').isInt().withMessage('Valid material is required'),
    body('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
    body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be greater than or equal to 0'),
    body('status').optional().isIn(['draft', 'ordered']).withMessage('Invalid status')
  ]), async (req, res) => {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
  
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
  
      const orderNumber = `PO-${Date.now()}`;
      const totalAmount = req.body.items.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice), 0);
  
      const orderResult = await client.query(orderQuery, [
        req.body.vendorId,
        orderNumber,
        totalAmount,
        req.body.status || 'draft',  // Default to draft instead of pending
        req.body.expectedDelivery || null,
        req.body.notes || null
      ]);
  
      const order = orderResult.rows[0];
  
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
  
      for (const item of req.body.items) {
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
  
      // After commit, fetch the complete order with items
      const finalOrderQuery = `
        SELECT 
          po.*,
          v.name as vendor_name,
          v.email as vendor_email,
          (
            SELECT json_agg(
              json_build_object(
                'id', poi.id,
                'material_id', poi.material_id,
                'material_name', m.name,
                'material_sku', m.sku,
                'quantity', poi.quantity,
                'unit_price', poi.unit_price,
                'total_price', poi.total_price,
                'notes', poi.notes
              )
            )
            FROM purchase_order_items poi
            JOIN materials m ON poi.material_id = m.id
            WHERE poi.purchase_order_id = po.id
          ) as items
        FROM purchase_orders po
        JOIN vendors v ON po.vendor_id = v.id
        WHERE po.id = $1
      `;
  
      const finalResult = await db.query(finalOrderQuery, [order.id]);
      res.status(201).json(finalResult.rows[0]);
  
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating order:', error);
      res.status(500).json({ 
        error: 'Failed to create order',
        details: error.message 
      });
    } finally {
      client.release();
    }
  });

  router.post('/send-email', [
    body('orderId').isInt(),
    body('vendorEmail').isEmail(),
    body('vendorName').notEmpty()
  ], async (req, res) => {
    try {
      const { orderId, vendorEmail, vendorName } = req.body;
  
      // Fetch complete order details
      const orderQuery = `
        SELECT 
          po.*,
          (
            SELECT json_agg(
              json_build_object(
                'material_name', m.name,
                'quantity', CAST(poi.quantity AS NUMERIC),
                'unit_price', CAST(poi.unit_price AS NUMERIC),
                'total_price', CAST(poi.total_price AS NUMERIC)
              )
            )
            FROM purchase_order_items poi
            JOIN materials m ON poi.material_id = m.id
            WHERE poi.purchase_order_id = po.id
          ) as items
        FROM purchase_orders po
        WHERE po.id = $1
      `;
  
      const orderResult = await db.query(orderQuery, [orderId]);
      
      if (orderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      const order = orderResult.rows[0];
      // Ensure items is an array
      order.items = order.items || [];
  
      // Generate email HTML
      const emailHtml = generatePurchaseOrderEmail(order, vendorName);
  
      try {
        // Use your existing sendEmail method
        await MicrosoftGraphEmailService.sendEmail(
          vendorEmail,
          `Purchase Order ${order.order_number}`,
          emailHtml
        );
  
        // Update order status to ordered
        await db.query(
          'UPDATE purchase_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['ordered', orderId]
        );
  
        res.json({ message: 'Order email sent successfully' });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        throw new Error(`Email service error: ${emailError.message}`);
      }
    } catch (error) {
      console.error('Error in send-email route:', error);
      res.status(500).json({ 
        error: 'Failed to process email request',
        details: error.message
      });
    }
  });

// Delete purchase order
router.delete('/:id', validate([
    param('id').isInt()
  ]), async (req, res) => {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
  
      // First, check if the order exists and get its status
      const checkOrderQuery = `
        SELECT status 
        FROM purchase_orders 
        WHERE id = $1
      `;
      const orderResult = await client.query(checkOrderQuery, [req.params.id]);
      
      if (orderResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Purchase order not found' });
      }
  
      // Don't allow deletion of received orders
      if (orderResult.rows[0].status === 'received') {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          error: 'Cannot delete a received purchase order'
        });
      }
  
      // Delete related records first
      await client.query(
        'DELETE FROM purchase_order_items WHERE purchase_order_id = $1',
        [req.params.id]
      );
  
      // Then delete the order itself
      const deleteOrderQuery = `
        DELETE FROM purchase_orders 
        WHERE id = $1 
        RETURNING id
      `;
      
      const result = await client.query(deleteOrderQuery, [req.params.id]);
      
      await client.query('COMMIT');
      
      res.json({ 
        message: 'Purchase order deleted successfully',
        id: req.params.id 
      });
  
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting order:', error);
      res.status(500).json({ 
        error: 'Failed to delete order',
        details: error.message 
      });
    } finally {
      client.release();
    }
  });


module.exports = router;