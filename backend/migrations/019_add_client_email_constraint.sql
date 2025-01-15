-- migrations/010_add_client_email_constraint.sql
-- Add unique constraint to client email if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'clients_email_unique' 
        AND table_name = 'clients'
    ) THEN
        -- First ensure email is not null where it doesn't need to be
        UPDATE clients SET email = 'no-email-' || id || '@placeholder.com' WHERE email IS NULL;
        
        -- Then add the constraint
        ALTER TABLE clients 
        ADD CONSTRAINT clients_email_unique UNIQUE (email);
    END IF;
END $$;