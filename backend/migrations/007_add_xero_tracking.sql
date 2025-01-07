-- migrations/007_add_xero_tracking.sql

-- Add Xero tracking fields to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS xero_export_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS xero_export_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS xero_export_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS xero_reference VARCHAR(100),
ADD COLUMN IF NOT EXISTS xero_error_message TEXT;