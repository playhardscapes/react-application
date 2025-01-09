-- migrations/010_create_estimates.sql

-- Estimates table
CREATE TABLE IF NOT EXISTS estimates (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    status VARCHAR(50) DEFAULT 'draft',
    total_amount DECIMAL(10,2),
    project_location TEXT,
    project_type VARCHAR(100),
    square_footage DECIMAL(10,2),
    
    -- Surface system details
    needs_pressure_wash BOOLEAN DEFAULT false,
    needs_acid_wash BOOLEAN DEFAULT false,
    patch_work_needed BOOLEAN DEFAULT false,
    patch_work_gallons DECIMAL(10,2),
    minor_crack_gallons DECIMAL(10,2),
    major_crack_gallons DECIMAL(10,2),
    fiberglass_mesh_needed BOOLEAN DEFAULT false,
    fiberglass_mesh_area DECIMAL(10,2),
    cushion_system_needed BOOLEAN DEFAULT false,
    cushion_system_area DECIMAL(10,2),

    -- Court configuration
    tennis_courts INTEGER DEFAULT 0,
    tennis_court_color VARCHAR(50),
    pickleball_courts INTEGER DEFAULT 0,
    pickleball_kitchen_color VARCHAR(50),
    pickleball_court_color VARCHAR(50),
    basketball_courts INTEGER DEFAULT 0,
    basketball_court_type VARCHAR(50),
    basketball_court_color VARCHAR(50),
    apron_color VARCHAR(50),

    -- Equipment
    permanent_tennis_poles INTEGER DEFAULT 0,
    permanent_pickleball_poles INTEGER DEFAULT 0,
    mobile_pickleball_nets INTEGER DEFAULT 0,
    low_grade_windscreen DECIMAL(10,2),
    high_grade_windscreen DECIMAL(10,2),
    basketball_systems JSONB,

    -- Logistics
    travel_days INTEGER DEFAULT 2,
    number_of_trips INTEGER DEFAULT 1,
    general_labor_hours DECIMAL(10,2),
    hotel_rate DECIMAL(10,2),
    logistical_notes TEXT,
    distance_to_site DECIMAL(10,2),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for updating timestamp
CREATE OR REPLACE TRIGGER update_estimates_updated_at
BEFORE UPDATE ON estimates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Proposals table (for tracking generated proposals)
CREATE TABLE IF NOT EXISTS proposals (
    id SERIAL PRIMARY KEY,
    estimate_id INTEGER REFERENCES estimates(id),
    client_id INTEGER REFERENCES clients(id),
    content TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for updating timestamp
CREATE OR REPLACE TRIGGER update_proposals_updated_at
BEFORE UPDATE ON proposals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();