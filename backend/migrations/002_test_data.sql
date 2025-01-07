-- migrations/002_test_data.sql

-- Clients
INSERT INTO clients (name, email, phone, address) VALUES
('Tennis Club RVA', 'manager@tennisclubrva.com', '(804) 555-0123', '123 Court Street, Richmond, VA 23220'),
('Pickleball Paradise', 'info@pickleballparadise.com', '(540) 555-0456', '456 Paddle Lane, Roanoke, VA 24011'),
('Community Center', 'director@communitycenter.org', '(757) 555-0789', '789 Recreation Dr, Virginia Beach, VA 23451');

-- Vendors
INSERT INTO vendors (name, vendor_type, email, phone, address, payment_terms, notes) VALUES
('California Sports Surfaces', 'Material Supplier', 'sales@californiasports.com', '(555) 123-4567', '1 Sports Way, CA', 'net30', 'Primary court coating supplier'),
('Nova Sports USA', 'Material Supplier', 'orders@novasports.com', '(555) 234-5678', '45 Industrial Park, MA', 'net45', 'Secondary supplier for specialty colors'),
('Equipment Pro', 'Equipment Supplier', 'sales@equipmentpro.com', '(555) 345-6789', '789 Tool Road, NC', 'net15', 'Pressure washing equipment supplier');

-- Proposals
INSERT INTO proposals (client_id, title, total_amount, status, proposal_date, follow_up_date, content) VALUES
(1, 'Tennis Court Resurfacing - 6 Courts', 48000.00, 'sent', '2024-01-02', '2024-01-09', 'Complete resurfacing of 6 tennis courts including crack repair and new lines'),
(2, 'New Pickleball Complex - 8 Courts', 86000.00, 'draft', '2024-01-05', '2024-01-12', 'Construction of 8 new pickleball courts with lighting'),
(3, 'Basketball Court Renovation', 12000.00, 'approved', '2023-12-15', '2023-12-22', 'Renovation of existing basketball court with new color coating system');

-- Contracts
INSERT INTO contracts (proposal_id, client_id, status, start_date, completion_date, contract_amount) VALUES
(3, 3, 'active', '2024-02-01', '2024-02-15', 12000.00);

-- Invoices
INSERT INTO invoices (vendor_id, invoice_number, amount, issue_date, due_date, status) VALUES
(1, 'CSS-2024-001', 5800.00, '2024-01-02', '2024-02-02', 'pending'),
(1, 'CSS-2024-002', 3200.00, '2024-01-03', '2024-02-03', 'pending'),
(2, 'NOVA-1201', 2400.00, '2024-01-04', '2024-02-18', 'pending');