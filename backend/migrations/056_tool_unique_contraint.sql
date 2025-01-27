-- Definitive tools unique constraint migration
BEGIN;

-- Remove duplicate tools, keeping the first occurrence
WITH duplicate_tools AS (
  SELECT 
    id,
    serial_number,
    brand,
    model,
    ROW_NUMBER() OVER (
      PARTITION BY serial_number, brand, model 
      ORDER BY id
    ) AS row_num
  FROM tools
)
DELETE FROM tool_maintenance 
WHERE tool_id IN (
  SELECT id FROM duplicate_tools WHERE row_num > 1
);

WITH duplicate_tools AS (
  SELECT 
    id,
    serial_number,
    brand,
    model,
    ROW_NUMBER() OVER (
      PARTITION BY serial_number, brand, model 
      ORDER BY id
    ) AS row_num
  FROM tools
)
DELETE FROM tool_assignments 
WHERE tool_id IN (
  SELECT id FROM duplicate_tools WHERE row_num > 1
);

WITH duplicate_tools AS (
  SELECT 
    id,
    serial_number,
    brand,
    model,
    ROW_NUMBER() OVER (
      PARTITION BY serial_number, brand, model 
      ORDER BY id
    ) AS row_num
  FROM tools
)
DELETE FROM tools
WHERE id IN (
  SELECT id FROM duplicate_tools WHERE row_num > 1
);

-- Drop existing unique index if it exists
DROP INDEX IF EXISTS idx_unique_tool_identifier;

-- Create unique index
CREATE UNIQUE INDEX idx_unique_tool_identifier 
ON tools (serial_number, brand, model);

-- Reset the sequence to ensure correct ID assignment
SELECT setval('tools_id_seq', (SELECT MAX(id) FROM tools));

COMMIT;