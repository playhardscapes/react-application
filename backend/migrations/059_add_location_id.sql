ALTER TABLE inventory_transactions 
ADD COLUMN location_id INTEGER REFERENCES material_locations(id);