-- migrations/013_create_clients.sql

-- Comprehensive diagnostic query to understand table structure
DO $$
DECLARE
    col RECORD;
    v_table_exists BOOLEAN;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'clients'
    ) INTO v_table_exists;

    RAISE NOTICE 'Clients table exists: %', v_table_exists;

    IF v_table_exists THEN
        RAISE NOTICE 'Existing columns in clients table:';
        FOR col IN 
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns 
            WHERE table_name = 'clients'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '% : % (max length: %)', 
                col.column_name, 
                col.data_type, 
                COALESCE(col.character_maximum_length::text, 'N/A');
        END LOOP;

        -- Attempt to add missing columns
        BEGIN
            ALTER TABLE clients ADD COLUMN IF NOT EXISTS city VARCHAR(100);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add city column: %', SQLERRM;
        END;

        BEGIN
            ALTER TABLE clients ADD COLUMN IF NOT EXISTS state VARCHAR(50);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add state column: %', SQLERRM;
        END;

        BEGIN
            ALTER TABLE clients ADD COLUMN IF NOT EXISTS organization VARCHAR(255);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add organization column: %', SQLERRM;
        END;

        BEGIN
            ALTER TABLE clients ADD COLUMN IF NOT EXISTS type VARCHAR(100);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add type column: %', SQLERRM;
        END;

        BEGIN
            ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(50);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add preferred_contact_method column: %', SQLERRM;
        END;

        BEGIN
            ALTER TABLE clients ADD COLUMN IF NOT EXISTS source VARCHAR(100);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add source column: %', SQLERRM;
        END;

        BEGIN
            ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_project_value DECIMAL(10,2) DEFAULT 0;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add total_project_value column: %', SQLERRM;
        END;

        BEGIN
            ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_projects INTEGER DEFAULT 0;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add total_projects column: %', SQLERRM;
        END;

        BEGIN
            ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_project_date DATE;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add last_project_date column: %', SQLERRM;
        END;

        -- Create indexes safely
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name)';
        
        BEGIN
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email)';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not create email index: %', SQLERRM;
        END;

        BEGIN
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_clients_city ON clients(city)';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not create city index: %', SQLERRM;
        END;

        BEGIN
            EXECUTE 'CREATE INDEX IF NOT EXISTS idx_clients_state ON clients(state)';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not create state index: %', SQLERRM;
        END;
    END IF;
END $$;

-- Ensure update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.triggers 
        WHERE event_object_table = 'clients' 
        AND trigger_name = 'update_clients_updated_at'
    ) THEN
        CREATE TRIGGER update_clients_updated_at
        BEFORE UPDATE ON clients
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Optional: Add seed data if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM clients WHERE name = 'Tennis Club RVA') THEN
        INSERT INTO clients (
            name, 
            email, 
            phone, 
            address, 
            city, 
            state, 
            zip, 
            organization, 
            type
        ) VALUES (
            'Tennis Club RVA', 
            'manager@tennisclubrva.com', 
            '(804) 555-0123', 
            '123 Court Street', 
            'Richmond', 
            'VA', 
            '23220',
            'Tennis Club',
            'Sports Facility'
        );
    END IF;
END $$;