-- migrations/003_materials_schema.sql

-- Create projects table first
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    client_id INTEGER REFERENCES clients(id),
    location TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    start_date DATE,
    completion_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create project status trigger
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Materials table to track inventory items
CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    category VARCHAR(100),  -- e.g., 'coating', 'binder', 'aggregate'
    unit VARCHAR(50),       -- e.g., 'gallons', 'bags', 'pounds'
    unit_size DECIMAL(10,2), -- e.g., 5 (for 5 gallon bucket)
    min_quantity INTEGER,   -- minimum quantity before reorder
    reorder_quantity INTEGER, -- suggested reorder amount
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory transactions to track stock levels
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id SERIAL PRIMARY KEY,
    material_id INTEGER REFERENCES materials(id),
    transaction_type VARCHAR(50), -- 'receive', 'use', 'adjust'
    quantity DECIMAL(10,2),
    unit_price DECIMAL(10,2),    -- price at time of transaction
    project_id INTEGER REFERENCES projects(id),
    vendor_id INTEGER REFERENCES vendors(id),
    batch_number VARCHAR(100),    -- for tracking specific batches
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Material usage estimates for projects
CREATE TABLE IF NOT EXISTS project_material_estimates (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    material_id INTEGER REFERENCES materials(id),
    estimated_quantity DECIMAL(10,2),
    actual_quantity DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Material locations (for multiple storage locations)
CREATE TABLE IF NOT EXISTS material_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Material stock levels at each location
CREATE TABLE IF NOT EXISTS material_stock (
    id SERIAL PRIMARY KEY,
    material_id INTEGER REFERENCES materials(id),
    location_id INTEGER REFERENCES material_locations(id),
    quantity DECIMAL(10,2),
    last_counted TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(material_id, location_id)
);

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_materials_updated_at ON materials;
CREATE TRIGGER update_materials_updated_at
    BEFORE UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_transactions_updated_at ON inventory_transactions;
CREATE TRIGGER update_inventory_transactions_updated_at
    BEFORE UPDATE ON inventory_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_material_estimates_updated_at ON project_material_estimates;
CREATE TRIGGER update_project_material_estimates_updated_at
    BEFORE UPDATE ON project_material_estimates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_material_locations_updated_at ON material_locations;
CREATE TRIGGER update_material_locations_updated_at
    BEFORE UPDATE ON material_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_material_stock_updated_at ON material_stock;
CREATE TRIGGER update_material_stock_updated_at
    BEFORE UPDATE ON material_stock
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
