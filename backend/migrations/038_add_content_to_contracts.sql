-- migrations/XXX_add_content_to_contracts.sql
ALTER TABLE contracts
ADD COLUMN content TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN contracts.content IS 'Stores the editable HTML content of the contract';