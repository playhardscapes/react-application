CREATE TABLE emails (
    id SERIAL PRIMARY KEY,
    sender_email VARCHAR(255),
    sender_name VARCHAR(255),
    recipient_email VARCHAR(255),
    subject VARCHAR(500),
    body TEXT,
    html_body TEXT,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'unread', -- unread, read, archived, deleted
    category VARCHAR(50), -- client, vendor, internal
    client_id INTEGER REFERENCES clients(id),
    vendor_id INTEGER REFERENCES vendors(id),
    attachments JSONB, -- store attachment metadata
    tags TEXT[], -- optional tagging system
    deleted_at TIMESTAMP WITH TIME ZONE
);