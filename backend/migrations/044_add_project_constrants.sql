-- migrations/012_add_project_constraints.sql

-- First remove any existing constraints
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_status_check') THEN
        ALTER TABLE projects DROP CONSTRAINT projects_status_check;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_priority_check') THEN
        ALTER TABLE projects DROP CONSTRAINT projects_priority_check;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_complexity_check') THEN
        ALTER TABLE projects DROP CONSTRAINT projects_complexity_check;
    END IF;
END $$;

-- Add status constraint
ALTER TABLE projects
ADD CONSTRAINT projects_status_check
CHECK (status IN ('pending', 'in_progress', 'completed', 'on_hold', 'cancelled'));

-- Add priority constraint
ALTER TABLE projects
ADD CONSTRAINT projects_priority_check
CHECK (priority IN ('low', 'medium', 'high'));

-- Add complexity constraint
ALTER TABLE projects
ADD CONSTRAINT projects_complexity_check
CHECK (complexity IN ('low', 'medium', 'high'));