-- migrations/015_update_logistics_column.sql

-- Ensure logistics column has a default structure
ALTER TABLE estimates 
ALTER COLUMN logistics SET DEFAULT '{
    "travelDays": 2,
    "numberOfTrips": 1,
    "generalLaborHours": 0,
    "hotelRate": 150,
    "logisticalNotes": "",
    "distanceToSite": 0
}'::jsonb;

-- Update existing records to have a consistent logistics structure
UPDATE estimates 
SET logistics = COALESCE(logistics, '{
    "travelDays": 2,
    "numberOfTrips": 1,
    "generalLaborHours": 0,
    "hotelRate": 150,
    "logisticalNotes": "",
    "distanceToSite": 0
}');

-- Add a check constraint to ensure the logistics column has the correct structure
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'check_logistics_structure'
    ) THEN
        ALTER TABLE estimates
        ADD CONSTRAINT check_logistics_structure
        CHECK (
            logistics ? 'travelDays' AND
            logistics ? 'numberOfTrips' AND
            logistics ? 'generalLaborHours' AND
            logistics ? 'hotelRate' AND
            logistics ? 'logisticalNotes' AND
            logistics ? 'distanceToSite'
        );
    END IF;
END $$;