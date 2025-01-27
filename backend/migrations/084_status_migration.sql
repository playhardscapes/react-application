-- Check purchase orders with received status
SELECT id, order_number, status FROM purchase_orders WHERE status IN ('received', 'partially_received');

-- Check inventory transactions for these orders
SELECT 
  it.id, 
  it.material_id, 
  it.transaction_type, 
  it.quantity, 
  it.reference_id, 
  it.reference_type,
  po.id as purchase_order_id,
  po.order_number
FROM 
  inventory_transactions it
JOIN 
  materials m ON it.material_id = m.id
LEFT JOIN 
  purchase_order_items poi ON poi.material_id = m.id
LEFT JOIN 
  purchase_orders po ON poi.purchase_order_id = po.id
WHERE 
  it.transaction_type = 'receive';