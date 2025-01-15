ALTER TABLE estimates 
DROP COLUMN IF EXISTS client_name,
DROP COLUMN IF EXISTS client_email,
DROP COLUMN IF EXISTS client_phone;

-- Make sure we have client_id with proper foreign key
ALTER TABLE estimates
ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES clients(id);