-- Migration to update document categories for different entity types

-- Create custom types for document categories
DO $$
BEGIN
    -- Drop existing types if they exist (optional)
    DROP TYPE IF EXISTS document_entity_type;
    DROP TYPE IF EXISTS document_category;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping existing types, continuing...';
END $$;

-- Create more flexible enum types
CREATE TYPE document_entity_type AS ENUM ('vendor', 'client', 'internal', 'project');
CREATE TYPE document_category AS ENUM (
    -- Vendor categories
    'specifications', 
    'technical_data', 
    'product_data', 
    'safety_data', 
    'bills', 
    'packing_lists',
    
    -- Client categories
    'invoice', 
    'contract', 
    'photos',
    
    -- Internal categories
    'insurance', 
    'w9',
    
    -- Project categories
    'project_specifications', 
    'project_photos',
    
    -- Fallback
    'other'
);

-- Update existing data with new categorization
UPDATE documents 
SET 
    entity_type = 
        CASE 
            WHEN category = 'product data' THEN 'vendor'
            WHEN category = 'Invoice' THEN 'client'
            ELSE 'vendor'  -- Default fallback
        END,
    category = 
        CASE 
            WHEN category = 'product data' THEN 'product_data'
            WHEN category = 'Invoice' THEN 'invoice'
            ELSE 'other'  -- Default fallback
        END;

-- Alter column types to use the new enums
ALTER TABLE documents 
ALTER COLUMN entity_type TYPE document_entity_type 
    USING (entity_type::document_entity_type),
ALTER COLUMN category TYPE document_category 
    USING (category::document_category);

-- Create a function to validate document categories
CREATE OR REPLACE FUNCTION validate_document_category(
    p_entity_type document_entity_type, 
    p_category document_category
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        (p_entity_type = 'vendor' AND p_category IN ('specifications', 'technical_data', 'product_data', 'safety_data', 'bills', 'packing_lists', 'other')) OR
        (p_entity_type = 'client' AND p_category IN ('invoice', 'contract', 'photos', 'other')) OR
        (p_entity_type = 'internal' AND p_category IN ('insurance', 'w9', 'other')) OR
        (p_entity_type = 'project' AND p_category IN ('project_specifications', 'project_photos', 'other'))
    );
END;
$$ LANGUAGE plpgsql;

-- Add a check constraint to enforce valid categories
DO $$
BEGIN
    BEGIN
        ALTER TABLE documents 
        ADD CONSTRAINT check_document_category 
        CHECK (validate_document_category(entity_type, category));
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Constraint already exists';
    END;
END $$;