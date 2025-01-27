-- First, let's add tables for tools tracking

-- Tools table
CREATE TABLE tools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),  -- e.g., 'power tool', 'hand tool', 'machinery'
    serial_number VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    purchase_date DATE,
    purchase_price NUMERIC(10,2),
    expected_lifetime_months INTEGER,
    last_maintenance_date DATE,
    maintenance_interval_days INTEGER,
    status VARCHAR(50) DEFAULT 'available',  -- 'available', 'in-use', 'maintenance', 'retired'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tool Check-out/Check-in tracking
CREATE TABLE tool_assignments (
    id SERIAL PRIMARY KEY,
    tool_id INTEGER REFERENCES tools(id),
    project_id INTEGER REFERENCES projects(id),
    checked_out_by INTEGER REFERENCES users(id),
    checked_out_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expected_return_date DATE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_in_by INTEGER REFERENCES users(id),
    condition_out TEXT,
    condition_in TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tool Maintenance Records
CREATE TABLE tool_maintenance (
    id SERIAL PRIMARY KEY,
    tool_id INTEGER REFERENCES tools(id),
    maintenance_date DATE,
    maintenance_type VARCHAR(100),  -- 'routine', 'repair', 'inspection'
    performed_by INTEGER REFERENCES users(id),
    cost NUMERIC(10,2),
    description TEXT,
    next_maintenance_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Project Tool Requirements
CREATE TABLE project_tool_requirements (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    tool_id INTEGER REFERENCES tools(id),
    quantity_needed INTEGER,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, tool_id)
);

-- Task Tool Requirements
CREATE TABLE task_tool_requirements (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES project_tasks(id),
    tool_id INTEGER REFERENCES tools(id),
    quantity_needed INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, tool_id)
);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_tools_updated_at
    BEFORE UPDATE ON tools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tool_assignments_updated_at
    BEFORE UPDATE ON tool_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tool_maintenance_updated_at
    BEFORE UPDATE ON tool_maintenance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tool_requirements_updated_at
    BEFORE UPDATE ON project_tool_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_tool_requirements_updated_at
    BEFORE UPDATE ON task_tool_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add useful indexes
CREATE INDEX idx_tool_assignments_project ON tool_assignments(project_id);
CREATE INDEX idx_tool_assignments_status ON tool_assignments(checked_in_at) 
    WHERE checked_in_at IS NULL;
CREATE INDEX idx_tool_maintenance_next_date ON tool_maintenance(next_maintenance_date);
CREATE INDEX idx_project_tool_requirements_dates ON 
    project_tool_requirements(start_date, end_date);

-- Create views for common queries
CREATE VIEW vw_tools_availability AS
SELECT 
    t.*,
    CASE 
        WHEN ta.id IS NOT NULL AND ta.checked_in_at IS NULL 
        THEN 'checked-out'
        WHEN tm.id IS NOT NULL AND tm.next_maintenance_date <= CURRENT_DATE 
        THEN 'needs-maintenance'
        ELSE 'available'
    END as current_status,
    ta.project_id as current_project,
    ta.expected_return_date,
    tm.next_maintenance_date
FROM tools t
LEFT JOIN tool_assignments ta ON t.id = ta.tool_id 
    AND ta.checked_in_at IS NULL
LEFT JOIN tool_maintenance tm ON t.id = tm.tool_id 
    AND tm.next_maintenance_date = (
        SELECT MAX(next_maintenance_date) 
        FROM tool_maintenance 
        WHERE tool_id = t.id
    );

CREATE VIEW vw_project_tool_needs AS
SELECT 
    p.id as project_id,
    p.title as project_title,
    t.id as tool_id,
    t.name as tool_name,
    ptr.quantity_needed,
    ptr.start_date,
    ptr.end_date,
    COALESCE(
        (SELECT COUNT(*) 
         FROM tool_assignments ta 
         WHERE ta.project_id = p.id 
         AND ta.tool_id = t.id 
         AND ta.checked_in_at IS NULL
        ), 0
    ) as currently_assigned
FROM projects p
JOIN project_tool_requirements ptr ON p.id = ptr.project_id
JOIN tools t ON ptr.tool_id = t.id
WHERE p.status NOT IN ('completed', 'cancelled');