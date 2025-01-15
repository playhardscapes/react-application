-- migrations/024_enhance_inventory_management.sql

-- Ensure related tables exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    category VARCHAR(100),
    unit VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS material_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory_adjustments table
CREATE TABLE IF NOT EXISTS inventory_adjustments (
    id SERIAL PRIMARY KEY,
    material_id INTEGER REFERENCES materials(id),
    location_id INTEGER REFERENCES material_locations(id),
    adjustment_type VARCHAR(50) 
        CHECK (adjustment_type IN ('manual', 'system', 'reconciliation', 'damage', 'loss', 'found')),
    quantity_change DECIMAL(10,2) NOT NULL,
    reason TEXT,
    performed_by INTEGER REFERENCES users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhance materials table
ALTER TABLE materials
ADD COLUMN IF NOT EXISTS reorder_point NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS ideal_stock_level NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS last_reorder_date DATE,
ADD COLUMN IF NOT EXISTS lead_time_days INTEGER
    CHECK (lead_time_days >= 0),
ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(255),
ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(10,2) 
    CHECK (unit_cost >= 0);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_material ON inventory_adjustments(material_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_location ON inventory_adjustments(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_type ON inventory_adjustments(adjustment_type);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_user ON inventory_adjustments(performed_by);

-- Trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger doesn't already exist
DROP TRIGGER IF EXISTS update_materials_updated_at ON materials;
CREATE TRIGGER update_materials_updated_at
    BEFORE UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();