CREATE TABLE vendor_bill_items (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES vendor_bills(id),
    material_id INTEGER REFERENCES materials(id),
    quantity NUMERIC(10,2) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    notes TEXT
);