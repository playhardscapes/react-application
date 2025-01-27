// src/routes/inventory.js
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validation');
const inventoryService = require('../services/inventoryService');
const toolsService = require('../services/toolsService');
const materialsService = require('../services/materialsService');
const ordersService = require('../services/ordersService');
const vendorBillsService = require('../services/vendorBillsService');

// Materials Routes
router.get('/materials', async (req, res) => {
  try {
    const materials = await materialsService.getAllMaterials();
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

router.get('/materials/stock', async (req, res) => {
  try {
    const stock = await materialsService.getStockByLocation();
    res.json(stock);
  } catch (error) {
    console.error('Error fetching stock levels:', error);
    res.status(500).json({ error: 'Failed to fetch stock levels' });
  }
});

router.get('/materials/reorder-needed', async (req, res) => {
  try {
    const materials = await materialsService.getReorderNeeded();
    res.json(materials);
  } catch (error) {
    console.error('Error fetching reorder list:', error);
    res.status(500).json({ error: 'Failed to fetch reorder list' });
  }
});

router.post('/materials/receive', 
  [
    body('materialId').isInt(),
    body('quantity').isFloat({ min: 0.01 }),
    body('locationId').isInt(),
    body('vendorId').isInt(),
    body('unitPrice').isFloat({ min: 0 })
  ],
  async (req, res) => {
    try {
      const transaction = await materialsService.receiveMaterials(req.body);
      res.status(201).json(transaction);
    } catch (error) {
      console.error('Error receiving materials:', error);
      res.status(500).json({ error: 'Failed to receive materials' });
    }
});

// Tools Routes
router.get('/tools', async (req, res) => {
  try {
    const tools = await toolsService.getAllTools();
    res.json(tools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({ error: 'Failed to fetch tools' });
  }
});

router.get('/tools/:id', async (req, res) => {
  try {
    const tool = await toolsService.getToolById(req.params.id);
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    res.json(tool);
  } catch (error) {
    console.error('Error fetching tool:', error);
    res.status(500).json({ error: 'Failed to fetch tool' });
  }
});

router.post('/tools/checkout',
  [
    body('toolId').isInt(),
    body('projectId').isInt(),
    body('userId').isInt(),
    body('expectedReturnDate').isISO8601()
  ],
  async (req, res) => {
    try {
      const assignment = await toolsService.checkOutTool(
        req.body.toolId,
        req.body.projectId,
        req.body.userId,
        req.body
      );
      res.status(201).json(assignment);
    } catch (error) {
      console.error('Error checking out tool:', error);
      res.status(500).json({ error: error.message });
    }
});

router.post('/tools/checkin',
  [
    body('toolId').isInt(),
    body('userId').isInt()
  ],
  async (req, res) => {
    try {
      const assignment = await toolsService.checkInTool(
        req.body.toolId,
        req.body.userId,
        req.body
      );
      res.status(200).json(assignment);
    } catch (error) {
      console.error('Error checking in tool:', error);
      res.status(500).json({ error: error.message });
    }
});

router.get('/tools/maintenance-needed', async (req, res) => {
  try {
    const tools = await toolsService.getToolsRequiringMaintenance();
    res.json(tools);
  } catch (error) {
    console.error('Error fetching maintenance needs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch maintenance needs', 
      details: error.message 
    });
  }
});

router.post('/tools/maintenance',
  [
    body('toolId').isInt(),
    body('maintenanceType').isString(),
    body('performedBy').isInt(),
    body('nextMaintenanceDate').isISO8601()
  ],
  async (req, res) => {
    try {
      const record = await toolsService.recordMaintenance(
        req.body.toolId,
        req.body
      );
      res.status(201).json(record);
    } catch (error) {
      console.error('Error recording maintenance:', error);
      res.status(500).json({ error: 'Failed to record maintenance' });
    }
});

// Project Tool Requirements
router.get('/projects/:id/tools', async (req, res) => {
  try {
    const requirements = await toolsService.getProjectToolRequirements(req.params.id);
    res.json(requirements);
  } catch (error) {
    console.error('Error fetching project tool requirements:', error);
    res.status(500).json({ error: 'Failed to fetch tool requirements' });
  }
});

router.post('/projects/:id/tools',
  [
    body('requirements').isArray(),
    body('requirements.*.toolId').isInt(),
    body('requirements.*.quantityNeeded').isInt({ min: 1 })
  ],
  async (req, res) => {
    try {
      await toolsService.updateProjectToolRequirements(
        req.params.id,
        req.body.requirements
      );
      res.status(200).json({ message: 'Tool requirements updated' });
    } catch (error) {
      console.error('Error updating tool requirements:', error);
      res.status(500).json({ error: 'Failed to update tool requirements' });
    }
});

// Inventory Audit Routes
router.post('/audit/materials',
  [
    body('counts').isArray(),
    body('counts.*.materialId').isInt(),
    body('counts.*.locationId').isInt(),
    body('counts.*.quantity').isFloat({ min: 0 })
  ],
  async (req, res) => {
    try {
      const results = await inventoryService.performMaterialsAudit(
        req.body.counts,
        req.user.id
      );
      res.status(200).json(results);
    } catch (error) {
      console.error('Error performing materials audit:', error);
      res.status(500).json({ error: 'Failed to perform audit' });
    }
});

router.post('/audit/tools',
  [
    body('tools').isArray(),
    body('tools.*.toolId').isInt(),
    body('tools.*.condition').isString(),
    body('tools.*.location').isString()
  ],
  async (req, res) => {
    try {
      const results = await inventoryService.performToolsAudit(
        req.body.tools,
        req.user.id
      );
      res.status(200).json(results);
    } catch (error) {
      console.error('Error performing tools audit:', error);
      res.status(500).json({ error: 'Failed to perform audit' });
    }
});

// Purchase Orders Routes
router.get('/orders', async (req, res) => {
  try {
    const { status, vendorId, limit } = req.query;
    const orders = await ordersService.getAllOrders({ 
      status, 
      vendorId, 
      limit: parseInt(limit) 
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.post('/orders', [
  body('vendorId').isInt(),
  body('items').isArray({ min: 1 }),
  body('items.*.materialId').isInt(),
  body('items.*.quantity').isFloat({ min: 0.01 }),
  body('items.*.unitPrice').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const order = await ordersService.createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/orders/:id', [
  param('id').isInt()
], async (req, res) => {
  try {
    const order = await ordersService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.patch('/orders/:id/status', [
  param('id').isInt(),
  body('status').isIn(['pending', 'approved', 'ordered', 'received', 'cancelled'])
], async (req, res) => {
  try {
    const order = await ordersService.updateOrderStatus(
      req.params.id, 
      req.body.status
    );
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

router.get('/orders/suggestions', async (req, res) => {
  try {
    const suggestions = await ordersService.getSuggestedOrders();
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching order suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch order suggestions' });
  }
});

// Vendor Bills Routes
router.get('/vendor-bills', async (req, res) => {
  try {
    const { status, vendorId, limit } = req.query;
    const bills = await vendorBillsService.getAllBills({ 
      status, 
      vendorId, 
      limit: parseInt(limit) 
    });
    res.json(bills);
  } catch (error) {
    console.error('Error fetching vendor bills:', error);
    res.status(500).json({ error: 'Failed to fetch vendor bills' });
  }
});

router.post('/vendor-bills', [
  body('vendorId').isInt(),
  body('issueDate').isISO8601(),
  body('dueDate').isISO8601(),
  body('items').isArray({ min: 1 }),
  body('items.*.materialId').isInt(),
  body('items.*.quantity').isFloat({ min: 0.01 }),
  body('items.*.unitPrice').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const bill = await vendorBillsService.createBill(req.body);
    res.status(201).json(bill);
  } catch (error) {
    console.error('Error creating vendor bill:', error);
    res.status(500).json({ error: 'Failed to create vendor bill' });
  }
});

router.get('/orders/:id/received-items', [
  param('id').isInt()
], validate([param('id').isInt()]), async (req, res) => {
  console.log('Received request for order:', req.params.id);
  try {
    const orderId = Number(req.params.id);
    console.log('Fetching items for order ID:', orderId);
    
    const items = await ordersService.getReceivedItems(orderId);
    
    console.log('Received items:', items);
    
    if (!items) {
      console.log('No items found for order');
      return res.status(404).json({ error: 'No received items found for this order' });
    }
    
    res.json(items);
  } catch (error) {
    console.error('Error in received-items route:', error);
    res.status(500).json({ 
      error: 'Failed to fetch received items', 
      details: error.message 
    });
  }
});

router.get('/vendor-bills/:id', [
  param('id').isInt().withMessage('Invalid bill ID')
], async (req, res) => {
  try {
    // Add some console logging
    console.log('Fetching bill with ID:', req.params.id);
    
    const bill = await vendorBillsService.getBillById(Number(req.params.id));
    
    if (!bill) {
      console.log('No bill found for ID:', req.params.id);
      return res.status(404).json({ error: 'Vendor bill not found' });
    }
    
    res.json(bill);
  } catch (error) {
    console.error('Detailed error fetching vendor bill:', error);
    res.status(500).json({ 
      error: 'Failed to fetch vendor bill', 
      details: error.message 
    });
  }
});

router.post('/vendor-bills/:id/pay', [
  param('id').isInt()
], async (req, res) => {
  try {
    const bill = await vendorBillsService.markBillAsPaid(req.params.id);
    res.json(bill);
  } catch (error) {
    console.error('Error marking bill as paid:', error);
    res.status(500).json({ error: 'Failed to mark bill as paid' });
  }
});

router.get('/vendor-bills/upcoming', async (req, res) => {
  try {
    const { daysBefore } = req.query;
    const bills = await vendorBillsService.getUpcomingBills(
      parseInt(daysBefore) || 7
    );
    res.json(bills);
  } catch (error) {
    console.error('Error fetching upcoming bills:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming bills' });
  }
});

module.exports = router;