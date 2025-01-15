-- migrations/XXX_create_estimates_table.sql

CREATE TABLE IF NOT EXISTS estimates (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    project_location TEXT,
    key_notes TEXT,
    
    -- Dimensions
    length NUMERIC(10,2),
    width NUMERIC(10,2),
    square_footage NUMERIC(10,2),
    
    -- Surface System
    needs_pressure_wash BOOLEAN DEFAULT true,
    needs_acid_wash BOOLEAN DEFAULT false,
    patch_work_needed BOOLEAN DEFAULT false,
    patch_work_gallons NUMERIC(10,2) DEFAULT 0,
    minor_crack_gallons NUMERIC(10,2) DEFAULT 0,
    major_crack_gallons NUMERIC(10,2) DEFAULT 0,
    fiberglass_mesh_needed BOOLEAN DEFAULT false,
    fiberglass_mesh_area NUMERIC(10,2) DEFAULT 0,
    cushion_system_needed BOOLEAN DEFAULT false,
    cushion_system_area NUMERIC(10,2) DEFAULT 0,
    
    -- Court Configuration
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
    low_grade_windscreen NUMERIC(10,2) DEFAULT 0,
    high_grade_windscreen NUMERIC(10,2) DEFAULT 0,
    basketball_systems JSONB DEFAULT '{}',
    
    -- Logistics
    logistics JSONB DEFAULT '{}',
    
    -- Status and Timestamps
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);