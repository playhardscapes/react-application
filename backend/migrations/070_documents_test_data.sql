INSERT INTO documents (
    entity_type, 
    entity_id, 
    filename, 
    original_name, 
    file_path, 
    file_size, 
    mime_type, 
    category
) VALUES 
(
    'client', 
    1, 
    'test-document.pdf', 
    'Test Document.pdf', 
    '/path/to/uploads/client/test-document.pdf', 
    1024, 
    'application/pdf', 
    'Invoice'
);