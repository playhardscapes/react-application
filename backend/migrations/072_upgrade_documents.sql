-- Create document access logs table if not exists
CREATE TABLE IF NOT EXISTS document_access_logs (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id),
  user_id INTEGER, -- Adjust based on your users table
  access_type VARCHAR(50) CHECK (access_type IN ('view', 'download', 'edit')),
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45)
);

-- Create tags table if not exists
CREATE TABLE IF NOT EXISTS document_tags (
  document_id INTEGER REFERENCES documents(id),
  tag_name VARCHAR(100),
  PRIMARY KEY (document_id, tag_name)
);

-- Optional: Add any missing columns to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS is_confidential BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS retention_period INTERVAL;

-- Create index on access logs for performance
CREATE INDEX IF NOT EXISTS idx_document_access_logs_document_id 
ON document_access_logs(document_id);

CREATE INDEX IF NOT EXISTS idx_document_access_logs_user_id 
ON document_access_logs(user_id);