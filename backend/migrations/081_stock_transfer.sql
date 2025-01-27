-- migrations/XXX_create_stock_transfers.sql
-- Create stock transfers table
CREATE TABLE IF NOT EXISTS stock_transfers (
    id SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL REFERENCES materials(id),
    from_location_id INTEGER NOT NULL REFERENCES material_locations(id),
    to_location_id INTEGER NOT NULL REFERENCES material_locations(id),
    quantity DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stock_transfers_material ON stock_transfers(material_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_from_location ON stock_transfers(from_location_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_to_location ON stock_transfers(to_location_id);

-- Also verify material_stock table exists with correct structure
CREATE TABLE IF NOT EXISTS material_stock (
    id SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL REFERENCES materials(id),
    location_id INTEGER NOT NULL REFERENCES material_locations(id),
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    last_counted TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_material_location UNIQUE (material_id, location_id),
    CONSTRAINT non_negative_quantity CHECK (quantity >= 0)
);

-- Create index for material_stock if not exists
CREATE INDEX IF NOT EXISTS idx_material_stock_material_location 
ON material_stock(material_id, location_id);