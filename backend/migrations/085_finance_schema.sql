-- Finance Schema (085_finance_schema.sql)
CREATE TABLE finance_transactions (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    vendor_id INTEGER REFERENCES vendors(id),
    payment_method TEXT NOT NULL,
    category TEXT NOT NULL,
    receipt_id INTEGER REFERENCES documents(id),
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

CREATE TABLE transaction_allocations (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES finance_transactions(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id),
    amount DECIMAL(12,2) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id)
);

CREATE TABLE bank_transactions (
    id SERIAL PRIMARY KEY,
    account_type TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    post_date DATE,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT NOT NULL,
    merchant_name TEXT,
    merchant_category TEXT,
    reference_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    finance_transaction_id INTEGER REFERENCES finance_transactions(id),
    imported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    reconciled_at TIMESTAMP WITH TIME ZONE,
    reconciled_by INTEGER REFERENCES users(id)
);

-- Create indexes
CREATE INDEX idx_finance_transactions_date ON finance_transactions(date);
CREATE INDEX idx_finance_transactions_status ON finance_transactions(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_finance_transactions_vendor ON finance_transactions(vendor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transaction_allocations_transaction ON transaction_allocations(transaction_id);
CREATE INDEX idx_bank_transactions_dates ON bank_transactions(transaction_date, post_date);
CREATE INDEX idx_bank_transactions_status ON bank_transactions(status);

-- Create function and trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_finance_transactions_timestamp
    BEFORE UPDATE ON finance_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_timestamp();

COMMENT ON TABLE finance_transactions IS 'Stores all financial transactions including credit card charges and manual entries';
COMMENT ON TABLE transaction_allocations IS 'Maps transactions to projects for cost allocation';
COMMENT ON TABLE bank_transactions IS 'Imported transaction data from bank/credit card feeds';