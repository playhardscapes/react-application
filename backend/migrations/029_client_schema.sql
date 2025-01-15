-- migrations/021_client_schema.sql

-- Create clients table if it doesn't exist
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    postal_code VARCHAR(20),
    type VARCHAR(50) DEFAULT 'business',
    organization VARCHAR(255),
    preferred_contact_method VARCHAR(50) DEFAULT 'email',
    source VARCHAR(100),
    total_project_value DECIMAL(10,2) DEFAULT 0,
    total_projects INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create client_follow_ups table if it doesn't exist
CREATE TABLE IF NOT EXISTS client_follow_ups (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    follow_up_date DATE NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium',
    completion_notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    assigned_to INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create client_notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS client_notes (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    note_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_city ON clients(city);
CREATE INDEX IF NOT EXISTS idx_clients_state ON clients(state);
CREATE INDEX IF NOT EXISTS idx_follow_ups_client ON client_follow_ups(client_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_date ON client_follow_ups(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON client_follow_ups(status);
CREATE INDEX IF NOT EXISTS idx_client_notes_client ON client_notes(client_id);

-- Update trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updating timestamps
DROP TRIGGER IF EXISTS update_clients_timestamp ON clients;
CREATE TRIGGER update_clients_timestamp
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_follow_ups_timestamp ON client_follow_ups;
CREATE TRIGGER update_follow_ups_timestamp
    BEFORE UPDATE ON client_follow_ups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_timestamp ON client_notes;
CREATE TRIGGER update_notes_timestamp
    BEFORE UPDATE ON client_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();