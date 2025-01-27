-- Insert sample vendor bills using subqueries to get existing IDs
WITH vendor_data AS (
    SELECT id as vendor_id 
    FROM vendors 
    LIMIT 1
),
material_data AS (
    SELECT id as material_id 
    FROM materials 
    LIMIT 2
),
inserted_bill AS (
    INSERT INTO vendor_bills (
        vendor_id,
        bill_number,
        total_amount,
        issue_date,
        due_date,
        status,
        notes
    ) 
    SELECT 
        vendor_id,
        'INV-2024-001',
        1250.00,
        '2024-01-15',
        '2024-02-15',
        'pending',
        'First order of 2024'
    FROM vendor_data
    RETURNING id, vendor_id
)
INSERT INTO vendor_bill_items (
    bill_id,
    material_id,
    quantity,
    unit_price,
    total_price,
    notes
)
SELECT 
    b.id,
    m.material_id,
    50.00,
    15.00,
    750.00,
    'Initial seed data'
FROM inserted_bill b
CROSS JOIN material_data m;