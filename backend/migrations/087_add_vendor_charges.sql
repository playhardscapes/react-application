-- Create enum type for charge types
CREATE TYPE charge_type AS ENUM (
  'freight',
  'shipping',
  'taxes',
  'handling',
  'pallet',
  'other'
);

-- Create bill_additional_charges table
CREATE TABLE bill_additional_charges (
  id SERIAL PRIMARY KEY,
  bill_id INTEGER REFERENCES vendor_bills(id) ON DELETE CASCADE,
  type charge_type NOT NULL,
  description VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_bill_charges_bill_id ON bill_additional_charges(bill_id);
CREATE INDEX idx_bill_charges_type ON bill_additional_charges(type);