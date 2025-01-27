-- Add archive columns to material_locations
ALTER TABLE material_locations
ADD COLUMN archived BOOLEAN DEFAULT false,
ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;

-- Create index on archived status for faster filtering
CREATE INDEX idx_material_locations_archived ON material_locations(archived);