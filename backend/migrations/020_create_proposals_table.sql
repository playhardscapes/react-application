-- migrations/021_create_proposals_table.sql

-- Create proposals table without adding any problematic columns
CREATE TABLE IF NOT EXISTS proposals (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    status VARCHAR(50) DEFAULT 'draft',
    title VARCHAR(255),
    content TEXT,
    total_amount DECIMAL(10,2),
    notes TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update proposals updated_at timestamp
CREATE OR REPLACE FUNCTION update_proposals_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for proposals table
DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals;
CREATE TRIGGER update_proposals_updated_at
    BEFORE UPDATE ON proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_proposals_updated_at_column();

-- Add indexes for faster lookups in proposals
CREATE INDEX IF NOT EXISTS idx_proposals_client ON proposals(client_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);