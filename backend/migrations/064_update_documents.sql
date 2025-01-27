-- Migration to add constraints and indexes to documents table

-- Add check constraints for entity types (IF NOT EXISTS)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'check_entity_type'
    ) THEN
        ALTER TABLE documents 
        ADD CONSTRAINT check_entity_type 
        CHECK (entity_type IN ('vendor', 'client', 'project', 'material', 'order', 'bill', 'internal'));
    END IF;
END $$;

-- Add check constraint for file size (IF NOT EXISTS)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'check_file_size'
    ) THEN
        ALTER TABLE documents 
        ADD CONSTRAINT check_file_size 
        CHECK (file_size >= 0 AND file_size <= 10485760);
    END IF;
END $$;

-- Add check constraint for status (IF NOT EXISTS)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'check_status'
    ) THEN
        ALTER TABLE documents 
        ADD CONSTRAINT check_status 
        CHECK (status IN ('active', 'archived', 'deleted'));
    END IF;
END $$;

-- Create indexes for faster querying (with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents (category);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents (created_at);

-- Add a trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.triggers
        WHERE event_object_table = 'documents'
        AND trigger_name = 'update_documents_modtime'
    ) THEN
        CREATE TRIGGER update_documents_modtime
        BEFORE UPDATE ON documents
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
    END IF;
END $$;