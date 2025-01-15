-- migrations/045_seed_projects_and_tasks.sql

-- Add sample projects using existing client and contract IDs
INSERT INTO projects 
(client_id, contract_id, title, status, location, start_date, completion_date, 
 estimated_hours, priority, complexity, notes)
VALUES
(17, 4, 'New Pickleball Complex - 8 Courts', 'in_progress', 'Roanoke, VA', 
 CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '30 days', 
 160.00, 'high', 'high',
 'Complete construction of 8 new pickleball courts with LED lighting system'),

(17, 3, 'Tennis Court Resurfacing', 'pending', 'Salem, VA',
 CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '21 days', 
 80.00, 'medium', 'low',
 'Full resurfacing of 4 tennis courts including crack repair and new color coating'),

(3, 1, 'Basketball Court Installation', 'in_progress', 'Blacksburg, VA',
 CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days', 
 120.00, 'high', 'medium',
 'Installation of 2 new outdoor basketball courts with adjustable height systems');

-- Add tasks for the first project (Pickleball Complex)
INSERT INTO project_tasks
(project_id, title, description, status, priority, due_date, estimated_hours)
SELECT 
  p.id,
  unnest(ARRAY[
    'Site Preparation',
    'Base Construction',
    'Court Surface Installation',
    'Line Marking',
    'Net System Installation',
    'Lighting Installation',
    'Final Inspection'
  ]),
  unnest(ARRAY[
    'Clear and level site, prepare drainage system',
    'Construct base layers including aggregate and asphalt',
    'Apply acrylic surface system layers',
    'Paint court lines according to official pickleball specifications',
    'Install permanent net posts and nets for all 8 courts',
    'Install LED lighting system and test',
    'Final quality check and client walkthrough'
  ]),
  unnest(ARRAY[
    'completed',
    'in_progress',
    'pending',
    'pending',
    'pending',
    'pending',
    'pending'
  ])::varchar,
  unnest(ARRAY[
    'medium',
    'high',
    'high',
    'medium',
    'medium',
    'high',
    'medium'
  ])::varchar,
  generate_series(
    CURRENT_DATE, 
    CURRENT_DATE + INTERVAL '30 days', 
    INTERVAL '5 days'
  ),
  unnest(ARRAY[24, 40, 32, 16, 16, 24, 8])
FROM projects p
WHERE p.title LIKE '%Pickleball Complex%'
LIMIT 1;

-- Add tasks for the Tennis Court Resurfacing project
INSERT INTO project_tasks
(project_id, title, description, status, priority, due_date, estimated_hours)
SELECT 
  p.id,
  unnest(ARRAY[
    'Power Washing',
    'Crack Repair',
    'Patching',
    'Acrylic Resurfacer Application',
    'Color Coating',
    'Line Painting'
  ]),
  unnest(ARRAY[
    'Deep clean court surface with pressure washer',
    'Fill and repair all existing cracks',
    'Apply patching compound to damaged areas',
    'Apply acrylic resurfacer base coat',
    'Apply color coating system',
    'Paint court lines in accordance with USTA specifications'
  ]),
  unnest(ARRAY[
    'pending',
    'pending',
    'pending',
    'pending',
    'pending',
    'pending'
  ])::varchar,
  unnest(ARRAY[
    'medium',
    'high',
    'medium',
    'high',
    'high',
    'medium'
  ])::varchar,
  generate_series(
    CURRENT_DATE + INTERVAL '14 days', 
    CURRENT_DATE + INTERVAL '21 days', 
    INTERVAL '1 day'
  ),
  unnest(ARRAY[8, 16, 16, 16, 16, 8])
FROM projects p
WHERE p.title LIKE '%Tennis Court%'
LIMIT 1;

-- Add tasks for the Basketball Court project
INSERT INTO project_tasks
(project_id, title, description, status, priority, due_date, estimated_hours)
SELECT 
  p.id,
  unnest(ARRAY[
    'Site Preparation',
    'Foundation Work',
    'Court Surface Installation',
    'Basketball System Installation',
    'Line Marking',
    'Final Cleanup'
  ]),
  unnest(ARRAY[
    'Clear site and establish proper drainage',
    'Pour concrete foundation according to specifications',
    'Install sport court surface tiles',
    'Install adjustable height basketball systems',
    'Paint court lines and three-point arcs',
    'Clean up site and prepare for handover'
  ]),
  unnest(ARRAY[
    'completed',
    'completed',
    'in_progress',
    'pending',
    'pending',
    'pending'
  ])::varchar,
  unnest(ARRAY[
    'high',
    'high',
    'high',
    'medium',
    'medium',
    'low'
  ])::varchar,
  generate_series(
    CURRENT_DATE - INTERVAL '5 days', 
    CURRENT_DATE + INTERVAL '10 days', 
    INTERVAL '3 days'
  ),
  unnest(ARRAY[16, 24, 32, 24, 16, 8])
FROM projects p
WHERE p.title LIKE '%Basketball Court%'
LIMIT 1;