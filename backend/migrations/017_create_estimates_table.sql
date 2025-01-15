-- migrations/016_create_estimates_table.sql

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create estimates table with comprehensive schema
CREATE TABLE IF NOT EXISTS estimates (
    id SERIAL PRIMARY KEY,
    
    -- Client Reference
    client_id INTEGER REFERENCES clients(id),
    
    -- Estimate Status
    status VARCHAR(50) DEFAULT 'draft',
    
    -- Project Dimensions
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    square_footage DECIMAL(10,2),
    
    -- Financial Details
    total_amount DECIMAL(10,2),
    estimated_total DECIMAL(10,2),
    margin_rate DECIMAL(5,2) DEFAULT 0.3,
    margin_amount DECIMAL(10,2),
    per_square_foot_cost DECIMAL(10,2),
    
    -- Detailed JSON Columns for Flexible Storage
    client_info JSONB,
    dimensions JSONB,
    surface_system JSONB,
    court_configuration JSONB,
    equipment JSONB,
    logistics JSONB,
    pricing_configuration JSONB,
    
    -- Additional Project Details
    project_location TEXT,
    project_type VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for automatic updated_at timestamp
DROP TRIGGER IF EXISTS update_estimates_updated_at ON estimates;
CREATE TRIGGER update_estimates_updated_at
BEFORE UPDATE ON estimates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Performance and Search Indexes
CREATE INDEX IF NOT EXISTS idx_estimates_client ON estimates(client_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimates_project_type ON estimates(project_type);
CREATE INDEX IF NOT EXISTS idx_estimates_square_footage ON estimates(square_footage);