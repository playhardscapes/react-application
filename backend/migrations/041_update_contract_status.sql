-- migrations/009_update_contract_status_constraints.sql

-- First remove any existing check constraints on status
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.constraint_column_usage 
        WHERE table_name = 'contracts' AND column_name = 'status'
    ) THEN
        EXECUTE (
            SELECT 'ALTER TABLE contracts DROP CONSTRAINT ' || constraint_name
            FROM information_schema.constraint_column_usage
            WHERE table_name = 'contracts' AND column_name = 'status'
        );
    END IF;
END $$;

-- Add new check constraint with all possible status values
ALTER TABLE contracts
    ALTER COLUMN status SET DEFAULT 'draft',
    ADD CONSTRAINT contracts_status_check 
    CHECK (status IN (
        'draft',
        'pending_signature',
        'signed',
        'active',
        'completed',
        'cancelled'
    ));

-- Update any existing 'pending' statuses to 'draft'
UPDATE contracts 
SET status = 'draft' 
WHERE status = 'pending';