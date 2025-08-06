-- Create organization invites table for advanced member management
-- Phase 3.1: Organization Invite System

\echo '🚀 Creating organization invites table...'

-- Create enum types for invite status and roles
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'rejected', 'expired', 'cancelled');
CREATE TYPE organization_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Create organization_invites table
CREATE TABLE organization_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invited_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Invite details
    email VARCHAR(255) NOT NULL,
    role organization_role NOT NULL DEFAULT 'member',
    status invite_status NOT NULL DEFAULT 'pending',
    
    -- Optional personalization
    message TEXT,
    invited_name VARCHAR(100),
    
    -- Timestamps and expiration
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Security and uniqueness
    token VARCHAR(64) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create indexes for performance
CREATE INDEX idx_organization_invites_organization_id ON organization_invites(organization_id);
CREATE INDEX idx_organization_invites_email ON organization_invites(email);
CREATE INDEX idx_organization_invites_invited_by_id ON organization_invites(invited_by_id);
CREATE INDEX idx_organization_invites_status ON organization_invites(status);
CREATE INDEX idx_organization_invites_token ON organization_invites(token);
CREATE INDEX idx_organization_invites_created_at ON organization_invites(created_at);
CREATE INDEX idx_organization_invites_expires_at ON organization_invites(expires_at);

-- Composite indexes for common queries
CREATE INDEX idx_organization_invites_org_status ON organization_invites(organization_id, status);
CREATE INDEX idx_organization_invites_email_status ON organization_invites(email, status);
CREATE INDEX idx_organization_invites_active_pending ON organization_invites(is_active, status) WHERE status = 'pending';

-- Unique constraint to prevent duplicate active invites
CREATE UNIQUE INDEX idx_organization_invites_unique_active 
ON organization_invites(organization_id, email) 
WHERE status = 'pending' AND is_active = TRUE;

-- Function to automatically mark expired invites
CREATE OR REPLACE FUNCTION mark_expired_invites() 
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE organization_invites 
    SET status = 'expired'
    WHERE status = 'pending' 
    AND expires_at < NOW() 
    AND is_active = TRUE;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a trigger to auto-mark expired invites on read
-- This is commented out to avoid performance impact, but can be enabled if needed
-- CREATE OR REPLACE FUNCTION check_invite_expiration() 
-- RETURNS TRIGGER AS $$
-- BEGIN
--     IF NEW.status = 'pending' AND NEW.expires_at < NOW() THEN
--         NEW.status = 'expired';
--     END IF;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER trigger_check_invite_expiration
--     BEFORE SELECT ON organization_invites
--     FOR EACH ROW
--     EXECUTE FUNCTION check_invite_expiration();

\echo '✅ Organization invites table created successfully'

-- Show table info
\d organization_invites;