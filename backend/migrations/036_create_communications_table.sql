-- Create communications table
CREATE TABLE communications (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    type VARCHAR(50) NOT NULL, -- email, sms, call
    direction VARCHAR(20) NOT NULL, -- inbound, outbound
    channel VARCHAR(50), -- sendgrid, twilio, phone
    sender_name VARCHAR(255),
    sender_contact VARCHAR(255),
    recipient_contact VARCHAR(255),
    message_content TEXT,
    subject VARCHAR(255),
    metadata JSONB,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'unhandled', -- unhandled, in_progress, resolved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Create index for performance
CREATE INDEX idx_communications_client_id ON communications(client_id);
CREATE INDEX idx_communications_status ON communications(status);