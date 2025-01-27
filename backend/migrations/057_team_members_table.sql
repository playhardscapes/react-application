-- 057_team_members_table.sql

-- Create project_team_members table
CREATE TABLE IF NOT EXISTS project_team_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    role VARCHAR(100),
    start_date DATE,
    end_date DATE,
    hours_allocated NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Create project_schedule table
CREATE TABLE IF NOT EXISTS project_schedule (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    dependencies INTEGER[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT project_schedule_type_check CHECK (
        type IN ('milestone', 'phase', 'task')
    )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_team_members_project ON project_team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_team_members_user ON project_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_schedule_project ON project_schedule(project_id);

-- Create triggers
DROP TRIGGER IF EXISTS update_project_team_members_updated_at ON project_team_members;
CREATE TRIGGER update_project_team_members_updated_at
    BEFORE UPDATE ON project_team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_schedule_updated_at ON project_schedule;
CREATE TRIGGER update_project_schedule_updated_at
    BEFORE UPDATE ON project_schedule
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();