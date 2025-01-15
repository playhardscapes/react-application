-- migrations/027_create_payments_scheduling.sql

-- Create project_schedule table
CREATE TABLE IF NOT EXISTS project_schedule (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    schedule_type VARCHAR(50) CHECK (schedule_type IN ('planned', 'actual')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed')),
    weather_dependent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create schedule_conflicts table
CREATE TABLE IF NOT EXISTS schedule_conflicts (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES project_schedule(id),
    conflict_type VARCHAR(50) CHECK (conflict_type IN ('resource', 'weather', 'other')),
    description TEXT,
    resolution_status VARCHAR(50) DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'resolved', 'ignored')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create weather_data table
CREATE TABLE IF NOT EXISTS weather_data (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    location_id INTEGER REFERENCES material_locations(id),
    temperature_high NUMERIC(4,1),
    temperature_low NUMERIC(4,1),
    precipitation_probability INTEGER,
    precipitation_amount NUMERIC(4,2),
    wind_speed NUMERIC(4,1),
    conditions VARCHAR(50),
    source VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create resource_allocation table
CREATE TABLE IF NOT EXISTS resource_allocation (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    resource_type VARCHAR(50) CHECK (resource_type IN ('labor', 'equipment', 'material')),
    resource_id INTEGER,
    quantity NUMERIC(10,2),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'allocated', 'in_use', 'complete')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create payment_schedules table
CREATE TABLE IF NOT EXISTS payment_schedules (
    id SERIAL PRIMARY KEY,
    contract_id INTEGER REFERENCES contracts(id),
    payment_number INTEGER,
    amount DECIMAL(10,2),
    due_date DATE,
    payment_type VARCHAR(50) CHECK (payment_type IN ('deposit', 'progress', 'final')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'invoiced', 'paid')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_project_schedule_project ON project_schedule(project_id);
CREATE INDEX idx_project_schedule_dates ON project_schedule(start_date, end_date);
CREATE INDEX idx_weather_data_date_location ON weather_data(date, location_id);
CREATE INDEX idx_resource_allocation_project ON resource_allocation(project_id);
CREATE INDEX idx_resource_allocation_dates ON resource_allocation(start_date, end_date);
CREATE INDEX idx_payment_schedules_contract ON payment_schedules(contract_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_project_schedule_updated_at
    BEFORE UPDATE ON project_schedule
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_conflicts_updated_at
    BEFORE UPDATE ON schedule_conflicts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_allocation_updated_at
    BEFORE UPDATE ON resource_allocation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_schedules_updated_at
    BEFORE UPDATE ON payment_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();