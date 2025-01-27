-- Add is_archived column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='client_follow_ups' AND column_name='is_archived'
    ) THEN
        ALTER TABLE client_follow_ups 
        ADD COLUMN is_archived BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Ensure the trigger exists
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'client_follow_ups' 
        AND trigger_name = 'update_client_follow_ups_modtime'
    ) THEN
        CREATE TRIGGER update_client_follow_ups_modtime
        BEFORE UPDATE ON client_follow_ups
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
    END IF;
END $$;