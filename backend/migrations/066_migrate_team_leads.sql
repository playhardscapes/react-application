-- 009_migrate_team_leads.sql
BEGIN;

-- First, migrate any existing team leads from projects to project_team_members
INSERT INTO project_team_members (project_id, user_id, role)
SELECT p.id, p.assigned_team_lead, 'team_lead'
FROM projects p
WHERE p.assigned_team_lead IS NOT NULL
AND NOT EXISTS (
  SELECT 1 
  FROM project_team_members ptm 
  WHERE ptm.project_id = p.id 
  AND ptm.role = 'team_lead'
);

-- Remove the assigned_team_lead column from projects
ALTER TABLE projects DROP COLUMN IF EXISTS assigned_team_lead;

COMMIT;