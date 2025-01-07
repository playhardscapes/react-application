-- migrations/006_add_payments.sql

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    reference_number VARCHAR(100),
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add payment-related trigger
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add payment_status function to check if an invoice is fully paid
CREATE OR REPLACE FUNCTION check_invoice_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if total payments equal or exceed invoice amount
    WITH payment_total AS (
        SELECT invoice_id, SUM(amount) as total_paid
        FROM payments
        WHERE invoice_id = NEW.invoice_id
        GROUP BY invoice_id
    )
    UPDATE invoices
    SET 
        status = CASE 
            WHEN pt.total_paid >= invoices.amount THEN 'paid'
            ELSE 'pending'
        END,
        updated_at = CURRENT_TIMESTAMP
    FROM payment_total pt
    WHERE invoices.id = NEW.invoice_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update invoice status when payments are made
DROP TRIGGER IF EXISTS payment_status_trigger ON payments;
CREATE TRIGGER payment_status_trigger
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION check_invoice_payment_status();