BEGIN;

-- Add team leads from users table to project_team_members
-- This will create entries for existing team leads
INSERT INTO project_team_members (project_id, user_id, role)
SELECT p.id, u.id, 'team_lead'
FROM projects p
CROSS JOIN users u
WHERE u.role = 'team_lead'
AND NOT EXISTS (
    SELECT 1 
    FROM project_team_members ptm 
    WHERE ptm.project_id = p.id 
    AND ptm.role = 'team_lead'
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_project_team_members_role ON project_team_members(role);

COMMIT;