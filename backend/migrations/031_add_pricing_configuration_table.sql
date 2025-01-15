-- Create pricing_configurations table
CREATE TABLE pricing_configurations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    value NUMERIC NOT NULL,
    unit VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure uniqueness of name within a category
    UNIQUE (name, category)
);

-- Optional: Add an index for faster category lookups
CREATE INDEX idx_pricing_category ON pricing_configurations(category);