-- 049_documents_update.sql
DO $$
BEGIN
    -- Add new columns if they don't exist
    BEGIN
        ALTER TABLE documents ADD COLUMN IF NOT EXISTS project_id INTEGER;
    EXCEPTION WHEN duplicate_column THEN
        -- Column already exists, do nothing
    END;

    BEGIN
        ALTER TABLE documents ADD COLUMN IF NOT EXISTS client_id INTEGER;
    EXCEPTION WHEN duplicate_column THEN
        -- Column already exists, do nothing
    END;

    BEGIN
        ALTER TABLE documents ADD COLUMN IF NOT EXISTS vendor_id INTEGER;
    EXCEPTION WHEN duplicate_column THEN
        -- Column already exists, do nothing
    END;

    BEGIN
        ALTER TABLE documents ADD COLUMN IF NOT EXISTS metadata JSONB;
    EXCEPTION WHEN duplicate_column THEN
        -- Column already exists, do nothing
    END;

    BEGIN
        ALTER TABLE documents ADD COLUMN IF NOT EXISTS version VARCHAR(50);
    EXCEPTION WHEN duplicate_column THEN
        -- Column already exists, do nothing
    END;

    BEGIN
        ALTER TABLE documents ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
    EXCEPTION WHEN duplicate_column THEN
        -- Column already exists, do nothing
    END;

    BEGIN
        ALTER TABLE documents ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
    EXCEPTION WHEN duplicate_column THEN
        -- Column already exists, do nothing
    END;

    -- Add foreign key constraints if needed
    BEGIN
        ALTER TABLE documents 
        ADD CONSTRAINT fk_document_client 
        FOREIGN KEY (client_id) 
        REFERENCES clients(id) 
        ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists, do nothing
    END;

    BEGIN
        ALTER TABLE documents 
        ADD CONSTRAINT fk_document_vendor 
        FOREIGN KEY (vendor_id) 
        REFERENCES vendors(id) 
        ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists, do nothing
    END;

    BEGIN
        ALTER TABLE documents 
        ADD CONSTRAINT fk_document_project 
        FOREIGN KEY (project_id) 
        REFERENCES projects(id) 
        ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists, do nothing
    END;
END $$;