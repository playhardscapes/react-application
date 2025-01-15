-- migrations/028_add_client_follow_ups.sql

-- Add new columns to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS organization VARCHAR(255),
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'business' 
    CHECK (type IN ('business', 'individual', 'organization')),
ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(50) DEFAULT 'email'
    CHECK (preferred_contact_method IN ('email', 'phone', 'both')),
ADD COLUMN IF NOT EXISTS source VARCHAR(100),
ADD COLUMN IF NOT EXISTS total_project_value DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_projects INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_project_date DATE;

-- Create client follow-ups table
CREATE TABLE IF NOT EXISTS client_follow_ups (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    follow_up_date DATE NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending'
        CHECK (status IN ('pending', 'completed', 'cancelled')),
    type VARCHAR(50) NOT NULL
        CHECK (type IN ('call', 'email', 'meeting', 'site_visit', 'initial_contact', 'other')),
    priority VARCHAR(50) DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high')),
    completion_notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create client notes table for tracking communication history
CREATE TABLE IF NOT EXISTS client_notes (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    note_type VARCHAR(50) NOT NULL
        CHECK (note_type IN ('communication', 'internal', 'meeting_notes', 'other')),
    content TEXT NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_follow_ups_client ON client_follow_ups(client_id);
CREATE INDEX IF NOT EXISTS idx_client_follow_ups_date ON client_follow_ups(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_client_follow_ups_status ON client_follow_ups(status);
CREATE INDEX IF NOT EXISTS idx_client_notes_client ON client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(type);
CREATE INDEX IF NOT EXISTS idx_clients_last_project ON clients(last_project_date);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_client_follow_ups_updated_at
    BEFORE UPDATE ON client_follow_ups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_notes_updated_at
    BEFORE UPDATE ON client_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update client project metrics
CREATE OR REPLACE FUNCTION update_client_project_metrics() 
RETURNS TRIGGER AS $client_metrics$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE clients
        SET 
            total_projects = total_projects + 1,
            total_project_value = COALESCE(total_project_value, 0) + COALESCE(NEW.total_amount, 0),
            last_project_date = CURRENT_DATE
        WHERE id = NEW.client_id;
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF OLD.total_amount IS DISTINCT FROM NEW.total_amount THEN
            UPDATE clients
            SET 
                total_project_value = COALESCE(total_project_value, 0) - COALESCE(OLD.total_amount, 0) + COALESCE(NEW.total_amount, 0),
                last_project_date = CURRENT_DATE
            WHERE id = NEW.client_id;
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE clients
        SET 
            total_projects = total_projects - 1,
            total_project_value = COALESCE(total_project_value, 0) - COALESCE(OLD.total_amount, 0)
        WHERE id = OLD.client_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$client_metrics$ LANGUAGE plpgsql;

-- Create trigger for project metrics
DROP TRIGGER IF EXISTS update_client_metrics ON projects;
CREATE TRIGGER update_client_metrics
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_client_project_metrics();

-- Add helpful comments
COMMENT ON TABLE client_follow_ups IS 'Tracks follow-up tasks and communication with clients';
COMMENT ON TABLE client_notes IS 'Stores communication history and internal notes about clients';
COMMENT ON COLUMN clients.type IS 'Categorizes clients as business, individual, or organization';
COMMENT ON COLUMN clients.preferred_contact_method IS 'Client''s preferred method of contact';
COMMENT ON COLUMN client_follow_ups.status IS 'Current status of the follow-up task';
COMMENT ON COLUMN client_follow_ups.type IS 'Type of follow-up action required';