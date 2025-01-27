-- migrations/078_average_cost.sql

-- Add new columns to material_purchases
ALTER TABLE material_purchases
    ADD COLUMN IF NOT EXISTS supplier TEXT,
    ADD COLUMN IF NOT EXISTS invoice_number TEXT,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);

-- Add constraints
ALTER TABLE material_purchases
    ADD CONSTRAINT positive_quantity CHECK (quantity_gallons > 0),
    ADD CONSTRAINT positive_containers CHECK (total_containers > 0),
    ADD CONSTRAINT positive_cost CHECK (cost_per_container > 0);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_material_purchases_updated_at
    BEFORE UPDATE ON material_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for average cost calculations
CREATE OR REPLACE VIEW material_average_costs AS
WITH container_counts AS (
    SELECT 
        material_id,
        container_size,
        COUNT(*) as count
    FROM material_purchases
    GROUP BY material_id, container_size
)
SELECT 
    m.id AS material_id,
    m.name AS material_name,
    COALESCE(
        ROUND(
            SUM(mp.total_cost) / NULLIF(SUM(mp.quantity_gallons), 0)
        , 2),
        0
    ) as avg_cost_per_gallon,
    SUM(mp.quantity_gallons) as total_gallons_purchased,
    COUNT(mp.id) as total_purchases,
    MAX(mp.purchase_date) as last_purchase_date,
    json_agg(
        json_build_object(
            'container_size', 
            CASE cc.container_size
                WHEN 5 THEN '5_gallon'
                WHEN 30 THEN '30_gallon'
                WHEN 55 THEN '55_gallon'
                ELSE 'unknown'
            END,
            'count', cc.count
        )
    ) FILTER (WHERE cc.container_size IS NOT NULL) as container_size_breakdown
FROM 
    materials m
LEFT JOIN 
    material_purchases mp ON m.id = mp.material_id
LEFT JOIN
    container_counts cc ON m.id = cc.material_id
GROUP BY 
    m.id, m.name;

-- Create function to calculate weighted average cost
CREATE OR REPLACE FUNCTION calculate_weighted_average_cost(p_material_id INTEGER)
RETURNS DECIMAL AS $$
DECLARE
    avg_cost DECIMAL;
BEGIN
    SELECT 
        COALESCE(
            ROUND(
                SUM(total_cost) / NULLIF(SUM(quantity_gallons), 0)
            , 2),
            0
        )
    INTO avg_cost
    FROM material_purchases
    WHERE material_id = p_material_id;
    
    RETURN avg_cost;
END;
$$ LANGUAGE plpgsql;

-- Add average_cost_per_gallon column to materials table if it doesn't exist
ALTER TABLE materials
ADD COLUMN IF NOT EXISTS average_cost_per_gallon DECIMAL(10,2);

-- Create function to update material average cost
CREATE OR REPLACE FUNCTION update_material_average_cost()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE materials
    SET average_cost_per_gallon = calculate_weighted_average_cost(NEW.material_id)
    WHERE id = NEW.material_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update average cost on purchase
CREATE TRIGGER update_material_average_cost_trigger
    AFTER INSERT OR UPDATE OR DELETE ON material_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_material_average_cost();

-- Down migration
COMMENT ON TABLE material_purchases IS 'To roll back this migration:
DROP TRIGGER IF EXISTS update_material_average_cost_trigger ON material_purchases;
DROP FUNCTION IF EXISTS update_material_average_cost();
DROP FUNCTION IF EXISTS calculate_weighted_average_cost(INTEGER);
DROP VIEW IF EXISTS material_average_costs;
DROP TRIGGER IF EXISTS update_material_purchases_updated_at ON material_purchases;
DROP FUNCTION IF EXISTS update_updated_at_column();
ALTER TABLE material_purchases DROP COLUMN IF EXISTS supplier;
ALTER TABLE material_purchases DROP COLUMN IF EXISTS invoice_number;
ALTER TABLE material_purchases DROP COLUMN IF EXISTS notes;
ALTER TABLE material_purchases DROP COLUMN IF EXISTS created_at;
ALTER TABLE material_purchases DROP COLUMN IF EXISTS updated_at;
ALTER TABLE material_purchases DROP COLUMN IF EXISTS created_by;
ALTER TABLE material_purchases DROP CONSTRAINT IF EXISTS positive_quantity;
ALTER TABLE material_purchases DROP CONSTRAINT IF EXISTS positive_containers;
ALTER TABLE material_purchases DROP CONSTRAINT IF EXISTS positive_cost;
ALTER TABLE materials DROP COLUMN IF EXISTS average_cost_per_gallon;
';