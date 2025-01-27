-- migrations/XXX_update_inventory_transactions.sql

-- Add reference columns to track what caused the transaction
ALTER TABLE inventory_transactions 
ADD COLUMN IF NOT EXISTS reference_id INTEGER,
ADD COLUMN IF NOT EXISTS reference_type VARCHAR(50);

-- Create index for better query performance on references
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_reference 
ON inventory_transactions(reference_id, reference_type);