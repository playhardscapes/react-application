-- migrations/014_standarize_logistics.sql

-- First add the logistics JSONB column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'estimates' 
                  AND column_name = 'logistics') THEN
        ALTER TABLE estimates 
        ADD COLUMN logistics JSONB;
    END IF;
END $$;

-- Migrate existing data to the JSONB column
UPDATE estimates 
SET logistics = jsonb_build_object(
    'travelDays', COALESCE(travel_days, 2),
    'numberOfTrips', COALESCE(number_of_trips, 1),
    'generalLaborHours', general_labor_hours,
    'hotelRate', COALESCE(hotel_rate, 150),
    'logisticalNotes', logistical_notes,
    'distanceToSite', distance_to_site
)
WHERE logistics IS NULL;

-- Then drop the old columns
ALTER TABLE estimates 
DROP COLUMN IF EXISTS travel_days,
DROP COLUMN IF EXISTS number_of_trips,
DROP COLUMN IF EXISTS general_labor_hours,
DROP COLUMN IF EXISTS hotel_rate,
DROP COLUMN IF EXISTS logistical_notes,
DROP COLUMN IF EXISTS distance_to_site;

-- Add the check constraint
ALTER TABLE estimates
ADD CONSTRAINT check_logistics_structure
CHECK (
    (logistics IS NULL) OR (
        logistics ? 'travelDays' AND 
        logistics ? 'numberOfTrips' AND
        logistics ? 'generalLaborHours' AND
        logistics ? 'hotelRate' AND
        logistics ? 'logisticalNotes'
    )
);