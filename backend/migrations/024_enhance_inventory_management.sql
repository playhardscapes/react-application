-- migrations/024_enhance_inventory_management.sql
CREATE TABLE IF NOT EXISTS inventory_adjustments (
    id SERIAL PRIMARY KEY,
    material_id INTEGER REFERENCES materials(id),
    location_id INTEGER REFERENCES material_locations(id),
    adjustment_type VARCHAR(50), -- 'manual', 'system', 'reconciliation'
    quantity_change DECIMAL(10,2),
    reason TEXT,
    performed_by INTEGER REFERENCES users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add more detailed tracking to materials table
ALTER TABLE materials
ADD COLUMN IF NOT EXISTS reorder_point NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS ideal_stock_level NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS last_reorder_date DATE;