-- Add type column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT column_name 
                   FROM information_schema.columns 
                   WHERE table_name='material_locations' AND column_name='type') THEN
        ALTER TABLE material_locations 
        ADD COLUMN type VARCHAR(50);
    END IF;
END $$;

-- Add project_id column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT column_name 
                   FROM information_schema.columns 
                   WHERE table_name='material_locations' AND column_name='project_id') THEN
        ALTER TABLE material_locations 
        ADD COLUMN project_id INTEGER;
    END IF;
END $$;

-- Add notes column conditionally (though you mentioned it already exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT column_name 
                   FROM information_schema.columns 
                   WHERE table_name='material_locations' AND column_name='notes') THEN
        ALTER TABLE material_locations 
        ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Create material_stock table if not exists
CREATE TABLE IF NOT EXISTS material_stock (
    id SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL REFERENCES materials(id),
    location_id INTEGER NOT NULL REFERENCES material_locations(id),
    quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
    container_type VARCHAR(100),
    container_identifier VARCHAR(100),
    received_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expiration_date DATE,
    batch_number VARCHAR(100)
);

-- Create stock_transfers table if not exists
CREATE TABLE IF NOT EXISTS stock_transfers (
    id SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL REFERENCES materials(id),
    from_location_id INTEGER REFERENCES material_locations(id),
    to_location_id INTEGER REFERENCES material_locations(id),
    quantity NUMERIC(10,2) NOT NULL,
    transfer_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    transferred_by INTEGER,
    notes TEXT
);

-- Optional: Update existing locations with a default type if not set
UPDATE material_locations 
SET type = 'storage' 
WHERE type IS NULL;