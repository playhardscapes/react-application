-- Migration to create user_roles table
-- Filename: 010_create_user_roles_table.sql

BEGIN;

-- Create user_roles table
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO user_roles (name, description, permissions) VALUES 
    ('user', 'Standard User', '{
        "dashboard": ["view"],
        "projects": ["view"],
        "tasks": ["view", "create"],
        "inventory": ["view"],
        "communications": ["view"]
    }'),
    ('team_lead', 'Team Lead', '{
        "dashboard": ["view"],
        "projects": ["view", "create", "edit", "assign"],
        "tasks": ["view", "create", "edit", "assign"],
        "inventory": ["view"],
        "communications": ["view", "respond"],
        "team": ["manage_members"]
    }'),
    ('admin', 'System Administrator', '{
        "dashboard": ["view", "manage"],
        "projects": ["view", "create", "edit", "delete"],
        "tasks": ["view", "create", "edit", "delete", "assign"],
        "inventory": ["view", "manage"],
        "users": ["view", "create", "edit", "delete"],
        "system": ["configure", "manage_roles"],
        "communications": ["view", "manage"],
        "financials": ["view", "manage"]
    }');

-- Add a constraint to ensure only valid roles are used
ALTER TABLE users 
ADD CONSTRAINT users_role_fkey 
FOREIGN KEY (role) 
REFERENCES user_roles(name);

COMMIT;