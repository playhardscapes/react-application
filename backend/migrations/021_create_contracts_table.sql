-- migrations/021_create_contracts_table.sql
-- Drop trigger if it exists first
DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts;

-- Create contracts table if it doesn't exist
CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER REFERENCES proposals(id),
    client_id INTEGER REFERENCES clients(id),
    
    -- Contract Details
    title VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    start_date DATE,
    completion_date DATE,
    contract_amount DECIMAL(10,2),
    
    -- Additional Details
    terms TEXT,
    special_conditions TEXT,
    
    -- Audit Columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger safely
CREATE TRIGGER update_contracts_updated_at
BEFORE UPDATE ON contracts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contracts_proposal ON contracts(proposal_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);