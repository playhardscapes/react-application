-- Migration to create material_locations table if not exists
CREATE TABLE IF NOT EXISTS material_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_material_locations_updated_at
BEFORE UPDATE ON material_locations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create material_stock table if not exists
CREATE TABLE IF NOT EXISTS material_stock (
    id SERIAL PRIMARY KEY,
    material_id INTEGER REFERENCES materials(id),
    location_id INTEGER REFERENCES material_locations(id),
    quantity NUMERIC(10,2) DEFAULT 0,
    last_counted TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(material_id, location_id)
);

-- Trigger for material_stock updated_at
CREATE OR REPLACE TRIGGER update_material_stock_updated_at
BEFORE UPDATE ON material_stock
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();