-- migrations/017_add_length_width_to_estimates.sql

-- Add length and width columns to estimates table if they don't exist
ALTER TABLE estimates
ADD COLUMN IF NOT EXISTS length NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS width NUMERIC(10,2);

-- Create an index on length and width for potential performance benefits
CREATE INDEX IF NOT EXISTS idx_estimates_length ON estimates(length);
CREATE INDEX IF NOT EXISTS idx_estimates_width ON estimates(width);