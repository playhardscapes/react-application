-- Add estimate_id to proposals table
ALTER TABLE proposals 
ADD COLUMN estimate_id integer REFERENCES estimates(id);

-- Add index for the new column
CREATE INDEX idx_proposals_estimate ON proposals(estimate_id);

-- Add notes field for additional context
ALTER TABLE proposals
ADD COLUMN notes text;