-- migrations/001_initial_schema.sql

-- Create clients table if it doesn't exist
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create proposals table if it doesn't exist
CREATE TABLE IF NOT EXISTS proposals (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    title VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    total_amount DECIMAL(10,2),
    content TEXT,
    proposal_date DATE,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create vendors table if it doesn't exist
CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    payment_terms VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create invoices table if it doesn't exist
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id),
    invoice_number VARCHAR(100),
    amount DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    issue_date DATE,
    due_date DATE,
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function for updating timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $func$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals;
CREATE TRIGGER update_proposals_updated_at
    BEFORE UPDATE ON proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendors_updated_at ON vendors;
CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
