-- 010_add_user_auth_fields.sql
BEGIN;

-- Add auth fields to users table
ALTER TABLE users
ADD COLUMN password_hash character varying(255),
ADD COLUMN last_login timestamp with time zone,
ADD COLUMN status character varying(50) DEFAULT 'active',
-- For password reset functionality
ADD COLUMN reset_token character varying(255),
ADD COLUMN reset_token_expires timestamp with time zone;

-- Add status index
CREATE INDEX idx_users_status ON users(status);

-- Add initial admin users
INSERT INTO users (name, email, role, status)
VALUES 
  ('Admin User 1', 'patrick@playhardscapes.com', 'admin', 'active'),
  ('Admin User 2', 'jeff@playhardscapes.com', 'admin', 'active');

COMMIT;