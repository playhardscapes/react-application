-- migrations/009_fix_vendors_table.sql

-- First, update the vendors table schema
DO $$ 
BEGIN
    -- Base contact fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'email') THEN
        ALTER TABLE vendors ADD COLUMN email VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'phone') THEN
        ALTER TABLE vendors ADD COLUMN phone VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'address') THEN
        ALTER TABLE vendors ADD COLUMN address TEXT;
    END IF;

    -- Add type and location fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'vendor_type') THEN
        ALTER TABLE vendors ADD COLUMN vendor_type VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'city') THEN
        ALTER TABLE vendors ADD COLUMN city VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'state') THEN
        ALTER TABLE vendors ADD COLUMN state VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'postal_code') THEN
        ALTER TABLE vendors ADD COLUMN postal_code VARCHAR(20);
    END IF;

    -- Sales contact fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'sales_contact_name') THEN
        ALTER TABLE vendors ADD COLUMN sales_contact_name VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'sales_contact_email') THEN
        ALTER TABLE vendors ADD COLUMN sales_contact_email VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'sales_contact_phone') THEN
        ALTER TABLE vendors ADD COLUMN sales_contact_phone VARCHAR(50);
    END IF;

    -- AP contact fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'ap_contact_name') THEN
        ALTER TABLE vendors ADD COLUMN ap_contact_name VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'ap_contact_email') THEN
        ALTER TABLE vendors ADD COLUMN ap_contact_email VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'ap_contact_phone') THEN
        ALTER TABLE vendors ADD COLUMN ap_contact_phone VARCHAR(50);
    END IF;

    -- Business fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'payment_terms') THEN
        ALTER TABLE vendors ADD COLUMN payment_terms VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'notes') THEN
        ALTER TABLE vendors ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Add helpful indexes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vendors_name') THEN
        CREATE INDEX idx_vendors_name ON vendors(name);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vendors_vendor_type') THEN
        CREATE INDEX idx_vendors_vendor_type ON vendors(vendor_type);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vendors_city') THEN
        CREATE INDEX idx_vendors_city ON vendors(city);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vendors_state') THEN
        CREATE INDEX idx_vendors_state ON vendors(state);
    END IF;
END $$;

-- Add helpful comments
COMMENT ON TABLE vendors IS 'Stores vendor information including contact details for both sales and accounts payable';
COMMENT ON COLUMN vendors.vendor_type IS 'Type of vendor (e.g., Material Supplier, Equipment Supplier)';
COMMENT ON COLUMN vendors.payment_terms IS 'Standard payment terms (e.g., net30, net45)';
COMMENT ON COLUMN vendors.sales_contact_name IS 'Primary sales representative name';
COMMENT ON COLUMN vendors.ap_contact_name IS 'Accounts payable contact name';