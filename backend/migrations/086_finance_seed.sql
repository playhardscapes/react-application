-- Insert sample finance transactions
INSERT INTO finance_transactions (
    date, amount, description, 
    payment_method, category, status, 
    created_by, updated_by
) VALUES 
    (CURRENT_DATE, 100.50, 'Office Supplies', 'credit_card', 'expense', 'pending', 3, 3),
    (CURRENT_DATE, 500.00, 'Project Revenue', 'bank_transfer', 'income', 'completed', 3, 3);

-- Insert sample bank transactions
INSERT INTO bank_transactions (
    account_type, transaction_date, post_date, amount, 
    description, merchant_name, status
) VALUES 
    ('checking', CURRENT_DATE, CURRENT_DATE, 100.50, 'Office Supplies Purchase', 'Staples', 'pending'),
    ('savings', CURRENT_DATE, CURRENT_DATE, 500.00, 'Client Payment', 'Client Inc', 'reconciled');