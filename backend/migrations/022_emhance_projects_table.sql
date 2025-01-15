-- migrations/022_enhance_projects_table.sql

-- Ensure users table exists (referenced in the migration)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Modify projects table to add new columns
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS contract_id INTEGER REFERENCES contracts(id),
ADD COLUMN IF NOT EXISTS assigned_team_lead INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS actual_hours NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS priority VARCHAR(50) 
    CHECK (priority IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN IF NOT EXISTS complexity VARCHAR(50) 
    CHECK (complexity IN ('simple', 'moderate', 'complex', 'advanced'));

-- Create project_team_members table
CREATE TABLE IF NOT EXISTS project_team_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(100),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_contract ON projects(contract_id);
CREATE INDEX IF NOT EXISTS idx_projects_team_lead ON projects(assigned_team_lead);
CREATE INDEX IF NOT EXISTS idx_project_team_members_project ON project_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_members_user ON project_team_members(user_id);

-- Trigger to update timestamps for project_team_members
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger doesn't already exist
DROP TRIGGER IF EXISTS update_project_team_members_updated_at ON project_team_members;