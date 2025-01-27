BEGIN;

-- Drop existing unique index if it exists
DROP INDEX IF EXISTS idx_unique_tool_identifier;

-- Create a new unique constraint
ALTER TABLE tools 
ADD CONSTRAINT unique_tool_identifier 
UNIQUE (serial_number, brand, model);

-- Optional: Create a supporting index
CREATE UNIQUE INDEX idx_unique_tool_identifier 
ON tools (serial_number, brand, model);

COMMIT;