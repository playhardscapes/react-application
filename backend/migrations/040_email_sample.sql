INSERT INTO emails (
  sender_email, 
  sender_name, 
  recipient_email, 
  subject, 
  body, 
  html_body, 
  attachments,
  category,
  status,
  received_at
) VALUES 
  (
    'john.doe@example.com',
    'John Doe',
    'patrick@playhardscapes.com',
    'Project Inquiry',
    'Hello, I am interested in a court resurfacing project.',
    '<p>Hello, I am interested in a court resurfacing project.</p>',
    '[]',
    'client',
    'unread',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
  ),
  (
    'jane.smith@vendorcompany.com',
    'Jane Smith',
    'patrick@playhardscapes.com',
    'Material Quotation',
    'Please find attached our latest pricing for court resurfacing materials.',
    '<p>Please find attached our latest pricing for court resurfacing materials.</p>',
    '[]',
    'vendor',
    'unread',
    CURRENT_TIMESTAMP - INTERVAL '1 week'
  ),
  (
    'support@equipment.com',
    'Equipment Supplier',
    'patrick@playhardscapes.com',
    'New Product Catalog',
    'Check out our latest equipment catalog for sports courts.',
    '<p>Check out our latest equipment catalog for sports courts.</p>',
    '[]',
    'uncategorized',
    'read',
    CURRENT_TIMESTAMP - INTERVAL '3 days'
  );