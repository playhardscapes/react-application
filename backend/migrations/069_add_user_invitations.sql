-- 011_add_user_invitations.sql
BEGIN;

CREATE TABLE user_invitations (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    invited_by INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for token lookups
CREATE INDEX idx_user_invitations_token ON user_invitations(token);

-- Add index for status checks
CREATE INDEX idx_user_invitations_status ON user_invitations(status);

COMMIT;