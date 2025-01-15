-- migrations/010_create_project_tasks.sql

-- Create project_tasks table
CREATE TABLE project_tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  priority VARCHAR(50) NOT NULL DEFAULT 'medium',
  due_date DATE,
  estimated_hours NUMERIC(10,2),
  actual_hours NUMERIC(10,2),
  assigned_to INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add status check constraint
ALTER TABLE project_tasks
ADD CONSTRAINT project_tasks_status_check
CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked'));

-- Add priority check constraint
ALTER TABLE project_tasks
ADD CONSTRAINT project_tasks_priority_check
CHECK (priority IN ('low', 'medium', 'high'));

-- Add indexes for better query performance
CREATE INDEX idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX idx_project_tasks_status ON project_tasks(status);
CREATE INDEX idx_project_tasks_assigned_to ON project_tasks(assigned_to);
CREATE INDEX idx_project_tasks_due_date ON project_tasks(due_date);

-- Add trigger to update updated_at
CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();