-- Comprehensive tools table modification
BEGIN;

-- Drop existing unique constraint if it exists
DO $$
BEGIN
    BEGIN
        ALTER TABLE tools 
        DROP CONSTRAINT IF EXISTS unique_tool_identifier;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop constraint';
    END;
END $$;

-- Drop existing unique index if it exists
DROP INDEX IF EXISTS idx_unique_tool_identifier;

-- Alter table to ensure columns exist
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS serial_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS model VARCHAR(100);

-- Create a new unique index
CREATE UNIQUE INDEX idx_unique_tool_identifier 
ON tools (serial_number, brand, model);

COMMIT;