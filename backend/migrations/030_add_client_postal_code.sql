-- migrations/022_add_client_postal_code.sql

-- Add missing columns to clients table
DO $$ 
BEGIN
    -- Add postal_code if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'clients' AND column_name = 'postal_code') THEN
        ALTER TABLE clients ADD COLUMN postal_code VARCHAR(20);
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'clients' AND column_name = 'status') THEN
        ALTER TABLE clients ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    END IF;

    -- Add archived columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'clients' AND column_name = 'archived_at') THEN
        ALTER TABLE clients ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'clients' AND column_name = 'archived_reason') THEN
        ALTER TABLE clients ADD COLUMN archived_reason TEXT;
    END IF;
END $$;
