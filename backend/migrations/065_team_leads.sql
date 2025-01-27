-- 009_add_team_leads.sql
BEGIN;

INSERT INTO users (name, email, role)
VALUES 
  ('John Smith', 'john.smith@playhardscp.com', 'team_lead'),
  ('Sarah Johnson', 'sarah.johnson@playhardscp.com', 'team_lead'),
  ('Mike Williams', 'mike.williams@playhardscp.com', 'team_lead'),
  ('Emily Davis', 'emily.davis@playhardscp.com', 'team_lead');

COMMIT;