-- First, drop existing estimates since we're in development
TRUNCATE TABLE estimates CASCADE;

-- Add type for estimate status
DO $$ BEGIN
    CREATE TYPE estimate_status AS ENUM ('draft', 'completed', 'archived', 'active');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Recreate estimates table with proper types
CREATE TABLE estimates (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    status estimate_status NOT NULL DEFAULT 'draft',
    total_amount DECIMAL(10,2),
    total_with_margin DECIMAL(10,2),
    margin_percentage DECIMAL(5,2) DEFAULT 0,
    project_location TEXT,
    project_type VARCHAR(100),
    
    -- Dimensions
    square_footage DECIMAL(10,2),
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    
    -- Surface Prep
    needs_pressure_wash BOOLEAN DEFAULT false,
    needs_acid_wash BOOLEAN DEFAULT false,
    patch_work_gallons DECIMAL(10,2) DEFAULT 0,
    minor_crack_gallons DECIMAL(10,2) DEFAULT 0,
    major_crack_gallons DECIMAL(10,2) DEFAULT 0,
    fiberglass_mesh_needed BOOLEAN DEFAULT false,
    fiberglass_mesh_area DECIMAL(10,2),
    cushion_system_needed BOOLEAN DEFAULT false,
    cushion_system_area DECIMAL(10,2),
    
    -- Courts
    tennis_courts INTEGER DEFAULT 0,
    tennis_court_color VARCHAR(50),
    pickleball_courts INTEGER DEFAULT 0,
    pickleball_court_color VARCHAR(50),
    pickleball_kitchen_color VARCHAR(50),
    basketball_courts INTEGER DEFAULT 0,
    basketball_court_type VARCHAR(50),
    basketball_court_color VARCHAR(50),
    basketball_lane_color VARCHAR(50),
    apron_color VARCHAR(50),
    
    -- Equipment
    permanent_tennis_poles INTEGER DEFAULT 0,
    permanent_pickleball_poles INTEGER DEFAULT 0,
    mobile_pickleball_nets INTEGER DEFAULT 0,
    low_grade_windscreen DECIMAL(10,2) DEFAULT 0,
    high_grade_windscreen DECIMAL(10,2) DEFAULT 0,
    
    -- JSON fields for complex data
    surface_prep_costs JSONB NOT NULL DEFAULT '{
        "pressure_wash": 0,
        "acid_wash": 0,
        "patch_work": {"materials": 0, "total": 0},
        "fiberglass_mesh": {"materials": 0, "installation": 0, "total": 0},
        "cushion_system": {"materials": 0, "installation": 0, "total": 0},
        "total": 0
    }'::jsonb,
    
    coating_costs JSONB NOT NULL DEFAULT '{
        "materials": {
            "resurfacer": {"cost": 0, "installation": 0},
            "color_coat": {"cost": 0, "installation": 0},
            "total": 0
        },
        "installation": {"labor": 0, "total": 0},
        "lining": {"materials": 0, "labor": 0, "total": 0},
        "total": 0
    }'::jsonb,
    
    equipment_costs JSONB NOT NULL DEFAULT '{
        "tennis": {"posts": 0, "installation": 0, "total": 0},
        "pickleball": {"posts": 0, "mobile_nets": 0, "installation": 0, "total": 0},
        "basketball": {"systems": 0, "installation": 0, "total": 0},
        "windscreen": {"materials": 0, "installation": 0, "total": 0},
        "total": 0
    }'::jsonb,
    
    logistics_costs JSONB NOT NULL DEFAULT '{
        "labor": {"hours": 0, "rate": 0, "total": 0},
        "lodging": {"nights": 0, "rate": 0, "total": 0},
        "mileage": {"distance": 0, "rate": 0, "total": 0},
        "total": 0
    }'::jsonb,
    
    logistics JSONB NOT NULL DEFAULT '{
        "travelDays": 2,
        "numberOfTrips": 1,
        "generalLaborHours": 0,
        "hotelRate": 150,
        "logisticalNotes": "",
        "distanceToSite": 0
    }'::jsonb,
    
    basketball_systems JSONB NOT NULL DEFAULT '[]'::jsonb,
    other_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Add constraints
    CHECK (margin_percentage >= 0 AND margin_percentage <= 100),
    CHECK (square_footage > 0 OR square_footage IS NULL),
    CHECK (length > 0 OR length IS NULL),
    CHECK (width > 0 OR width IS NULL),
    CHECK (tennis_courts >= 0),
    CHECK (pickleball_courts >= 0),
    CHECK (basketball_courts >= 0)
);

-- Create indexes
CREATE INDEX idx_estimates_client ON estimates(client_id);
CREATE INDEX idx_estimates_status ON estimates(status);
CREATE INDEX idx_estimates_created_at ON estimates(created_at);
CREATE INDEX idx_estimates_total_amount ON estimates(total_amount);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_estimates_updated_at
    BEFORE UPDATE ON estimates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();