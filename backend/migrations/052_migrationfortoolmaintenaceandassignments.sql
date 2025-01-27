-- Migration for tool maintenance and assignments

-- Ensure tool_maintenance table exists
CREATE TABLE IF NOT EXISTS tool_maintenance (
    id SERIAL PRIMARY KEY,
    tool_id INTEGER REFERENCES tools(id),
    maintenance_date DATE,
    next_maintenance_date DATE,
    maintenance_type VARCHAR(100),
    performed_by INTEGER, -- Reference to users table
    cost NUMERIC(10,2),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure tool_assignments table exists
CREATE TABLE IF NOT EXISTS tool_assignments (
    id SERIAL PRIMARY KEY,
    tool_id INTEGER REFERENCES tools(id),
    project_id INTEGER, -- Optional reference to projects table
    checked_out_by INTEGER, -- Reference to users table
    checked_in_by INTEGER, -- Reference to users table
    checked_out_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    expected_return_date DATE,
    condition_out TEXT,
    condition_in TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create or replace trigger to update updated_at column for tool_maintenance
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_tool_maintenance_updated_at
BEFORE UPDATE ON tool_maintenance
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_tool_assignments_updated_at
BEFORE UPDATE ON tool_assignments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Optional: Alter tools table to ensure maintenance-related columns exist
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS maintenance_interval_days INTEGER,
ADD COLUMN IF NOT EXISTS last_maintenance_date DATE;