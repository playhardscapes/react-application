-- migrations/012_create_estimate.sql

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS update_estimates_updated_at ON estimates;

-- Function for updating timestamps (create if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure estimates table exists with explicit columns
CREATE TABLE IF NOT EXISTS estimates (
    id SERIAL PRIMARY KEY,
    
    -- Client Information
    client_id INTEGER REFERENCES clients(id),
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    client_location TEXT,
    
    -- Financial Details
    total_amount DECIMAL(10,2),
    estimated_total DECIMAL(10,2),
    margin_rate DECIMAL(5,2) DEFAULT 0.3,
    margin_amount DECIMAL(10,2),
    per_square_foot_cost DECIMAL(10,2),

    -- Project Details
    project_location TEXT,
    project_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    
    -- Dimensions
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    square_footage DECIMAL(10,2),
    
    -- Surface System Details (JSON for flexible storage)
    surface_system JSONB,
    
    -- Court Configuration (JSON for flexible storage)
    court_configuration JSONB,
    
    -- Equipment (JSON for flexible storage)
    equipment JSONB,
    
    -- Logistics
    logistics JSONB,
    
    -- Pricing Configuration
    pricing_configuration JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger safely
DROP TRIGGER IF EXISTS update_estimates_updated_at ON estimates;
CREATE TRIGGER update_estimates_updated_at
BEFORE UPDATE ON estimates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance and searchability
CREATE INDEX IF NOT EXISTS idx_estimates_client ON estimates(client_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimates_project_type ON estimates(project_type);
CREATE INDEX IF NOT EXISTS idx_estimates_client_name ON estimates(client_name);
CREATE INDEX IF NOT EXISTS idx_estimates_project_location ON estimates(project_location);