// src/components/inventory/index.js
export { default as InventoryDashboard } from './InventoryDashboard';

// Materials Components
export { default as MaterialsList } from './materials/MaterialsList';
export { default as MaterialDetail } from './materials/MaterialDetail';
export { default as ReceiveMaterials } from './materials/ReceiveMaterials';
export { default as EditMaterial } from './materials/EditMaterial';

// Tools Components
export { default as ToolsList } from './tools/ToolsList';
export { default as ToolDetail } from './tools/ToolDetail';
export { default as ToolMaintenance } from './tools/ToolMaintenance';
export { default as MaintenanceSchedule } from './tools/MaintenanceSchedule';
export { default as EditTool } from './tools/EditTool';

// Locations Components
export { default as LocationsList } from './locations/LocationsList';
export { default as LocationDetail } from './locations/LocationDetail';
export { default as AddLocationDialog } from './locations/AddLocationDialog';
export { default as ArchivedLocationsList } from './locations/ArchivedLocationsList';
export { default as LocationTransferDialog } from './locations/LocationTransferDialog';

// Audit Components
export { default as InventoryAudit } from './audit/InventoryAudit';

// Orders Components
export { default as PurchaseOrders } from './orders/PurchaseOrders';
export { default as CreateOrder } from './orders/CreateOrder';
export { default as OrderDetail } from './orders/OrderDetail';
export { default as EditOrder } from './orders/EditOrder';

// Vendor Bills Components
export { default as VendorBillsList } from './vendor-bills/VendorBillsList';
export { default as CreateVendorBill } from './vendor-bills/CreateVendorBill';
export { default as VendorBillDetail } from './vendor-bills/VendorBillDetail';
export { default as EditVendorBill } from './vendor-bills/EditVendorBill';