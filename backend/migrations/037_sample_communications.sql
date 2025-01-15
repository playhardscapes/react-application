-- First, identify which clients are referenced in estimates
WITH referenced_clients AS (
    SELECT DISTINCT client_id 
    FROM estimates
)
SELECT c.id, c.name, c.email
FROM clients c
JOIN referenced_clients rc ON c.id = rc.client_id
WHERE c.email IN ('pfrancocm@gmail.com');

-- If you want to update instead of delete
UPDATE clients
SET email = 'unique_' || email
WHERE id IN (
    SELECT client_id 
    FROM estimates
) AND email IN ('pfrancocm@gmail.com');

-- Now add the unique constraint
ALTER TABLE clients ADD CONSTRAINT unique_client_email UNIQUE (email);

-- Insert sample communications
INSERT INTO clients (name, email, phone) VALUES 
  ('John Doe', 'john@example.com', '540-123-4567'),
  ('Jane Smith', 'jane@example.com', '540-987-6543')
ON CONFLICT (email) DO NOTHING;

INSERT INTO communications (
  client_id, 
  type, 
  direction, 
  channel, 
  sender_name, 
  sender_contact, 
  recipient_contact, 
  message_content, 
  status, 
  received_at,
  created_at,
  updated_at
) VALUES 
  (
    (SELECT id FROM clients WHERE email = 'john@example.com'),
    'sms', 
    'inbound', 
    'twilio', 
    'John Doe', 
    '540-123-4567', 
    '540-384-4854', 
    'Interested in court resurfacing. Can you provide a quote?', 
    'unhandled', 
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    (SELECT id FROM clients WHERE email = 'jane@example.com'),
    'email', 
    'inbound', 
    'sendgrid', 
    'Jane Smith', 
    'jane@example.com', 
    'patrick@playhardscapes.com', 
    'Looking to discuss a tennis court project', 
    'unhandled', 
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );