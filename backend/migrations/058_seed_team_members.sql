-- 058_seed_team_members.sql

-- Seed project team members
INSERT INTO project_team_members (project_id, user_id, role)
SELECT 
    p.id,
    u.id,
    CASE floor(random() * 3)
        WHEN 0 THEN 'construction'
        WHEN 1 THEN 'design'
        ELSE 'management'
    END
FROM 
    projects p
    CROSS JOIN (
        SELECT id FROM users 
        WHERE role = 'team_member' 
        OR role = 'manager'
        LIMIT 5
    ) u
WHERE 
    NOT EXISTS (
        SELECT 1 
        FROM project_team_members ptm 
        WHERE ptm.project_id = p.id AND ptm.user_id = u.id
    )
    AND p.status = 'in_progress';

-- Seed project schedule
INSERT INTO project_schedule (
    project_id,
    start_date,
    end_date,
    schedule_type,
    status,
    weather_dependent
)
SELECT 
    p.id,
    p.start_date + (floor(random() * 7))::integer,
    p.start_date + (floor(random() * 30 + 14))::integer,
    CASE floor(random() * 2)
        WHEN 0 THEN 'planned'
        ELSE 'actual'
    END,
    CASE floor(random() * 4)
        WHEN 0 THEN 'pending'
        WHEN 1 THEN 'in_progress'
        WHEN 2 THEN 'completed'
        ELSE 'delayed'
    END,
    random() > 0.7  -- 30% chance of being weather dependent
FROM 
    projects p
WHERE 
    p.status = 'in_progress'
    AND p.start_date IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 
        FROM project_schedule ps 
        WHERE ps.project_id = p.id
    );