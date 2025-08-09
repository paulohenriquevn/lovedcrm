-- 001_complete_initial_schema.sql
-- Complete initial database schema for multi-tenant SaaS
-- Consolidates: users, organizations, invites, billing, sessions, 2FA, preferences
-- Generated: 2025-01-08 - Consolidated Version

\echo '🚀 Creating consolidated initial schema...'

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\echo '✅ Extensions enabled'

-- ============================================================================
-- SCHEMA VERSIONS TRACKING
-- ============================================================================

-- Schema versions table (for tracking migrations)
CREATE TABLE IF NOT EXISTS schema_versions (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT NOT NULL
);

\echo '✅ Schema versions table created'

-- ============================================================================
-- CORE USER MANAGEMENT
-- ============================================================================

-- Users table with complete authentication fields
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password TEXT,
    full_name VARCHAR(255),
    bio TEXT,
    location VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    
    -- OAuth integration
    google_id VARCHAR(255) UNIQUE,
    
    -- Account status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_superuser BOOLEAN NOT NULL DEFAULT false,
    
    -- Password reset functionality
    password_reset_token VARCHAR(255) DEFAULT NULL,
    password_reset_expires TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    
    -- Email verification functionality  
    email_verification_token VARCHAR(255) DEFAULT NULL,
    email_verification_expires TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    
    -- Force password change (invite flow)
    must_change_password BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);

-- Users table comments
COMMENT ON COLUMN users.password_reset_token IS 'Token for password reset functionality';
COMMENT ON COLUMN users.password_reset_expires IS 'Expiration timestamp for password reset token';
COMMENT ON COLUMN users.email_verification_token IS 'Token for email verification functionality';
COMMENT ON COLUMN users.email_verification_expires IS 'Expiration timestamp for email verification token';
COMMENT ON COLUMN users.must_change_password IS 'Force password change on next login (used for invite flow with temporary passwords)';

\echo '✅ Users table created with complete authentication fields'

-- ============================================================================
-- ORGANIZATION MANAGEMENT
-- ============================================================================

-- Organizations table  
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    website VARCHAR(255),
    logo_url TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Organization indexes
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON organizations(created_at);

\echo '✅ Organizations table created'

-- ============================================================================
-- ORGANIZATION MEMBERSHIP
-- ============================================================================

-- Create enum types for roles  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'organization_role') THEN
        CREATE TYPE organization_role AS ENUM ('owner', 'admin', 'member', 'viewer');
    END IF;
END$$;

-- Organization members table (for multi-tenancy)
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role organization_role NOT NULL DEFAULT 'member',
    is_active BOOLEAN NOT NULL DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- Organization members indexes
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_organization_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_role ON organization_members(role);

\echo '✅ Organization members table created'

-- ============================================================================
-- ORGANIZATION INVITES SYSTEM
-- ============================================================================

-- Create enum types for invite status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invite_status') THEN
        CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'rejected', 'expired', 'cancelled');
    END IF;
END$$;

-- Create organization_invites table
CREATE TABLE IF NOT EXISTS organization_invites (
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

-- Organization invites indexes
CREATE INDEX IF NOT EXISTS idx_organization_invites_organization_id ON organization_invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_invites_email ON organization_invites(email);
CREATE INDEX IF NOT EXISTS idx_organization_invites_invited_by_id ON organization_invites(invited_by_id);
CREATE INDEX IF NOT EXISTS idx_organization_invites_status ON organization_invites(status);
CREATE INDEX IF NOT EXISTS idx_organization_invites_token ON organization_invites(token);
CREATE INDEX IF NOT EXISTS idx_organization_invites_created_at ON organization_invites(created_at);
CREATE INDEX IF NOT EXISTS idx_organization_invites_expires_at ON organization_invites(expires_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_organization_invites_org_status ON organization_invites(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_organization_invites_email_status ON organization_invites(email, status);
CREATE INDEX IF NOT EXISTS idx_organization_invites_active_pending ON organization_invites(is_active, status) WHERE status = 'pending';

-- Unique constraint to prevent duplicate active invites
CREATE UNIQUE INDEX IF NOT EXISTS idx_organization_invites_unique_active 
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

\echo '✅ Organization invites system created'

-- ============================================================================
-- USER SESSIONS MANAGEMENT
-- ============================================================================

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Session identification
    session_token VARCHAR(255) UNIQUE NOT NULL,
    
    -- Device and location information
    device_info VARCHAR(500),
    ip_address VARCHAR(45), -- Support IPv4 and IPv6
    location VARCHAR(255),
    user_agent TEXT,
    
    -- Session state
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamps
    last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Constraints
    CONSTRAINT check_expires_at_future CHECK (expires_at > created_at),
    CONSTRAINT check_session_token_length CHECK (char_length(session_token) >= 32)
);

-- Performance indexes for common queries
CREATE INDEX IF NOT EXISTS ix_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS ix_user_sessions_organization_id ON user_sessions(organization_id);
CREATE INDEX IF NOT EXISTS ix_user_sessions_user_org ON user_sessions(user_id, organization_id);
CREATE INDEX IF NOT EXISTS ix_user_sessions_active ON user_sessions(is_active, expires_at);
CREATE INDEX IF NOT EXISTS ix_user_sessions_cleanup ON user_sessions(expires_at, is_active);
CREATE INDEX IF NOT EXISTS ix_user_sessions_session_token ON user_sessions(session_token);

-- Composite index for session validation
CREATE INDEX IF NOT EXISTS ix_user_sessions_validation ON user_sessions(session_token, organization_id, is_active, expires_at);

-- Index for cleanup operations
CREATE INDEX IF NOT EXISTS ix_user_sessions_expired ON user_sessions(expires_at) WHERE is_active = true;

-- Add comments for documentation
COMMENT ON TABLE user_sessions IS 'User session tracking for multi-device support and security monitoring';
COMMENT ON COLUMN user_sessions.session_token IS 'Unique token identifying the session (cryptographically secure)';
COMMENT ON COLUMN user_sessions.device_info IS 'Human-readable device information (e.g., "Chrome 120.0 on Windows 10")';
COMMENT ON COLUMN user_sessions.ip_address IS 'Client IP address (IPv4 or IPv6)';
COMMENT ON COLUMN user_sessions.location IS 'Geographic location derived from IP (e.g., "São Paulo, Brasil")';
COMMENT ON COLUMN user_sessions.user_agent IS 'Full user agent string from client';
COMMENT ON COLUMN user_sessions.last_activity IS 'Timestamp of last session activity (updated on each request)';
COMMENT ON COLUMN user_sessions.expires_at IS 'Session expiration time (default: 30 days from creation)';

-- Function to automatically update last_activity
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update last_activity if other fields changed
    IF NEW.ip_address IS DISTINCT FROM OLD.ip_address OR
       NEW.location IS DISTINCT FROM OLD.location THEN
        NEW.last_activity = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_activity
CREATE TRIGGER trigger_update_session_activity
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_session_activity();

-- Function for cleaning up expired sessions (can be called by cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions(batch_size INTEGER DEFAULT 1000)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE user_sessions 
    SET is_active = false 
    WHERE id IN (
        SELECT id 
        FROM user_sessions 
        WHERE expires_at <= NOW() 
          AND is_active = true 
        LIMIT batch_size
    );
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for multi-tenancy security
CREATE INDEX IF NOT EXISTS ix_user_sessions_security ON user_sessions(user_id, organization_id, is_active) 
WHERE expires_at > NOW();

\echo '✅ User sessions management system created'

-- ============================================================================
-- TWO-FACTOR AUTHENTICATION
-- ============================================================================

-- Create user_two_factor table
CREATE TABLE IF NOT EXISTS user_two_factor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- TOTP Configuration
    secret_key VARCHAR(32) NOT NULL,  -- Base32 encoded secret (matches model)
    
    -- Backup Codes (stored as JSON array of hashed codes)
    backup_codes JSONB DEFAULT '[]'::jsonb,
    backup_codes_used JSONB DEFAULT '[]'::jsonb,
    
    -- Status and Timestamps
    is_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints: one 2FA setup per user per organization
    CONSTRAINT uq_user_two_factor_user_org UNIQUE (user_id, organization_id)
);

-- User and organization lookup (most common query)
CREATE INDEX IF NOT EXISTS ix_user_two_factor_user_org 
ON user_two_factor(user_id, organization_id);

-- Organization filtering for admin queries
CREATE INDEX IF NOT EXISTS ix_user_two_factor_organization_id 
ON user_two_factor(organization_id);

-- Enabled users for statistics
CREATE INDEX IF NOT EXISTS ix_user_two_factor_enabled 
ON user_two_factor(organization_id, is_enabled) 
WHERE is_enabled = true;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_two_factor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_two_factor_updated_at_trigger
    BEFORE UPDATE ON user_two_factor
    FOR EACH ROW
    EXECUTE FUNCTION update_user_two_factor_updated_at();

-- Cleanup function for incomplete setups
CREATE OR REPLACE FUNCTION cleanup_incomplete_2fa_setups(days_old INTEGER DEFAULT 7)
RETURNS INTEGER AS $$
DECLARE
    cleanup_count INTEGER;
BEGIN
    DELETE FROM user_two_factor 
    WHERE is_enabled = FALSE 
      AND confirmed_at IS NULL 
      AND created_at < NOW() - INTERVAL '1 day' * days_old;
    
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    
    RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql;

-- Helper function for 2FA statistics
CREATE OR REPLACE FUNCTION get_2fa_statistics(org_id UUID)
RETURNS TABLE(
    total_setups BIGINT,
    enabled_users BIGINT,
    confirmed_users BIGINT,
    adoption_rate NUMERIC(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE is_enabled = TRUE) as enabled,
            COUNT(*) FILTER (WHERE is_enabled = TRUE AND confirmed_at IS NOT NULL) as confirmed
        FROM user_two_factor 
        WHERE organization_id = org_id
    )
    SELECT 
        s.total,
        s.enabled,
        s.confirmed,
        CASE 
            WHEN s.total > 0 THEN ROUND((s.enabled::NUMERIC / s.total::NUMERIC) * 100, 2)
            ELSE 0.00
        END
    FROM stats s;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE user_two_factor ENABLE ROW LEVEL SECURITY;

-- Comments for documentation
COMMENT ON TABLE user_two_factor IS 'Two-factor authentication settings per user per organization';
COMMENT ON COLUMN user_two_factor.secret_key IS 'Base32-encoded TOTP secret key';
COMMENT ON COLUMN user_two_factor.backup_codes IS 'JSON array of hashed backup codes';
COMMENT ON COLUMN user_two_factor.backup_codes_used IS 'JSON array of used backup code hashes';
COMMENT ON COLUMN user_two_factor.is_enabled IS 'Whether 2FA is active for this user';
COMMENT ON COLUMN user_two_factor.confirmed_at IS 'When user first confirmed 2FA setup';
COMMENT ON COLUMN user_two_factor.last_used_at IS 'Last successful 2FA verification';

\echo '✅ Two-factor authentication system created'

-- ============================================================================
-- USER PREFERENCES
-- ============================================================================

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Display & UI Preferences
    theme VARCHAR(20) DEFAULT 'system' NOT NULL,  -- light, dark, system
    language VARCHAR(10) DEFAULT 'en' NOT NULL,   -- en, pt, es
    timezone VARCHAR(50) DEFAULT 'UTC' NOT NULL,
    date_format VARCHAR(20) DEFAULT 'MM/dd/yyyy' NOT NULL,
    time_format VARCHAR(10) DEFAULT '12h' NOT NULL,  -- 12h, 24h
    
    -- Notification Preferences
    email_notifications BOOLEAN DEFAULT TRUE NOT NULL,
    push_notifications BOOLEAN DEFAULT TRUE NOT NULL,
    sms_notifications BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Email Notification Types
    email_marketing BOOLEAN DEFAULT FALSE NOT NULL,
    email_product_updates BOOLEAN DEFAULT TRUE NOT NULL,
    email_security_alerts BOOLEAN DEFAULT TRUE NOT NULL,
    email_billing_alerts BOOLEAN DEFAULT TRUE NOT NULL,
    email_team_activity BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- Dashboard & Display Preferences
    dashboard_layout VARCHAR(20) DEFAULT 'default' NOT NULL,  -- default, compact, expanded
    items_per_page VARCHAR(10) DEFAULT '20' NOT NULL,  -- 10, 20, 50, 100
    show_onboarding BOOLEAN DEFAULT TRUE NOT NULL,
    show_tips BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- Privacy & Security Preferences
    profile_visibility VARCHAR(20) DEFAULT 'organization' NOT NULL,  -- private, organization, public
    activity_status BOOLEAN DEFAULT TRUE NOT NULL,  -- Show online status
    
    -- Quiet Hours (JSON format: {"enabled": false, "start": "22:00", "end": "08:00", "timezone": "UTC"})
    quiet_hours JSONB DEFAULT '{"enabled": false, "start": "22:00", "end": "08:00", "timezone": "UTC"}'::jsonb,
    
    -- Custom preferences (flexible JSON field for future extensions)
    custom_settings JSONB DEFAULT '{}'::jsonb,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints: one preferences setup per user per organization
    CONSTRAINT uq_user_preferences_user_org UNIQUE (user_id, organization_id),
    
    -- Value constraints for enum-like fields
    CONSTRAINT ck_user_preferences_theme CHECK (theme IN ('light', 'dark', 'system')),
    CONSTRAINT ck_user_preferences_time_format CHECK (time_format IN ('12h', '24h')),
    CONSTRAINT ck_user_preferences_dashboard_layout CHECK (dashboard_layout IN ('default', 'compact', 'expanded')),
    CONSTRAINT ck_user_preferences_items_per_page CHECK (items_per_page IN ('10', '20', '50', '100')),
    CONSTRAINT ck_user_preferences_profile_visibility CHECK (profile_visibility IN ('private', 'organization', 'public'))
);

-- User and organization lookup (most common query)
CREATE INDEX IF NOT EXISTS ix_user_preferences_user_org 
ON user_preferences(user_id, organization_id);

-- Organization filtering for admin queries
CREATE INDEX IF NOT EXISTS ix_user_preferences_organization_id 
ON user_preferences(organization_id);

-- User preferences lookup
CREATE INDEX IF NOT EXISTS ix_user_preferences_user_id 
ON user_preferences(user_id);

-- Common query patterns
CREATE INDEX IF NOT EXISTS ix_user_preferences_theme 
ON user_preferences(theme);

CREATE INDEX IF NOT EXISTS ix_user_preferences_language 
ON user_preferences(language);

-- Notification preferences for bulk operations
CREATE INDEX IF NOT EXISTS ix_user_preferences_email_notifications 
ON user_preferences(organization_id, email_notifications) 
WHERE email_notifications = true;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_preferences_updated_at_trigger
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_user_preferences_updated_at();

-- Helper function for default preferences
CREATE OR REPLACE FUNCTION create_default_user_preferences(
    p_user_id UUID,
    p_organization_id UUID,
    p_language VARCHAR(10) DEFAULT 'en',
    p_timezone VARCHAR(50) DEFAULT 'UTC'
)
RETURNS UUID AS $$
DECLARE
    preferences_id UUID;
BEGIN
    INSERT INTO user_preferences (
        user_id,
        organization_id,
        language,
        timezone
    ) VALUES (
        p_user_id,
        p_organization_id,
        COALESCE(p_language, 'en'),
        COALESCE(p_timezone, 'UTC')
    )
    RETURNING id INTO preferences_id;
    
    RETURN preferences_id;
EXCEPTION
    WHEN unique_violation THEN
        -- Return existing preferences ID if already exists
        SELECT id INTO preferences_id
        FROM user_preferences
        WHERE user_id = p_user_id AND organization_id = p_organization_id;
        
        RETURN preferences_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function for preferences statistics
CREATE OR REPLACE FUNCTION get_preferences_statistics(org_id UUID)
RETURNS TABLE(
    total_users BIGINT,
    theme_light BIGINT,
    theme_dark BIGINT,
    theme_system BIGINT,
    email_notifications_enabled BIGINT,
    push_notifications_enabled BIGINT,
    most_common_language VARCHAR(10),
    most_common_timezone VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE theme = 'light') as light,
            COUNT(*) FILTER (WHERE theme = 'dark') as dark,
            COUNT(*) FILTER (WHERE theme = 'system') as system,
            COUNT(*) FILTER (WHERE email_notifications = TRUE) as email_enabled,
            COUNT(*) FILTER (WHERE push_notifications = TRUE) as push_enabled,
            MODE() WITHIN GROUP (ORDER BY language) as common_lang,
            MODE() WITHIN GROUP (ORDER BY timezone) as common_tz
        FROM user_preferences 
        WHERE organization_id = org_id
    )
    SELECT 
        s.total,
        s.light,
        s.dark,
        s.system,
        s.email_enabled,
        s.push_enabled,
        s.common_lang,
        s.common_tz
    FROM stats s;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Comments for documentation
COMMENT ON TABLE user_preferences IS 'User preferences and settings per organization';
COMMENT ON COLUMN user_preferences.theme IS 'UI theme preference: light, dark, or system';
COMMENT ON COLUMN user_preferences.language IS 'Language code preference (ISO 639-1)';
COMMENT ON COLUMN user_preferences.timezone IS 'Timezone preference (IANA timezone identifier)';
COMMENT ON COLUMN user_preferences.quiet_hours IS 'JSON configuration for notification quiet hours';
COMMENT ON COLUMN user_preferences.custom_settings IS 'Flexible JSON field for future preference extensions';
COMMENT ON COLUMN user_preferences.profile_visibility IS 'Profile visibility: private, organization, or public';
COMMENT ON COLUMN user_preferences.activity_status IS 'Whether to show online/activity status';

\echo '✅ User preferences system created'

-- ============================================================================
-- BILLING SYSTEM
-- ============================================================================

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    price_cents INTEGER NOT NULL DEFAULT 0,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Plans indexes
CREATE INDEX IF NOT EXISTS idx_plans_slug ON plans(slug);
CREATE INDEX IF NOT EXISTS idx_plans_is_active ON plans(is_active);
CREATE INDEX IF NOT EXISTS idx_plans_created_at ON plans(created_at);

-- Create organization_subscriptions table
CREATE TABLE IF NOT EXISTS organization_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Organization subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_organization_id ON organization_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_plan_id ON organization_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_is_active ON organization_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_stripe_subscription_id ON organization_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_created_at ON organization_subscriptions(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_org_active ON organization_subscriptions(organization_id, is_active);

-- Unique constraint to ensure one active subscription per organization
CREATE UNIQUE INDEX IF NOT EXISTS idx_org_subscriptions_unique_active 
ON organization_subscriptions(organization_id) 
WHERE is_active = TRUE;

\echo '✅ Billing system tables created'

-- ============================================================================
-- BILLING UTILITY FUNCTIONS
-- ============================================================================

-- Function to assign basic plan to existing organizations
CREATE OR REPLACE FUNCTION assign_basic_plan_to_existing_orgs() 
RETURNS INTEGER AS $$
DECLARE
    basic_plan_id UUID;
    org_count INTEGER := 0;
BEGIN
    -- Get basic plan ID
    SELECT id INTO basic_plan_id FROM plans WHERE slug = 'basic' LIMIT 1;
    
    IF basic_plan_id IS NULL THEN
        RAISE EXCEPTION 'Basic plan not found';
    END IF;
    
    -- Assign basic plan to all organizations without subscription
    INSERT INTO organization_subscriptions (organization_id, plan_id, is_active)
    SELECT o.id, basic_plan_id, TRUE
    FROM organizations o
    WHERE NOT EXISTS (
        SELECT 1 FROM organization_subscriptions os 
        WHERE os.organization_id = o.id AND os.is_active = TRUE
    );
    
    GET DIAGNOSTICS org_count = ROW_COUNT;
    
    -- Log the result
    RAISE NOTICE 'Assigned basic plan to % existing organizations', org_count;
    
    RETURN org_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update plan features from environment variables
CREATE OR REPLACE FUNCTION update_plan_from_config(
    plan_slug VARCHAR(50),
    plan_name VARCHAR(100),
    plan_price INTEGER,
    plan_features JSONB
) 
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE plans 
    SET 
        name = plan_name,
        price_cents = plan_price,
        features = plan_features,
        updated_at = NOW()
    WHERE slug = plan_slug;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

\echo '✅ Billing utility functions created'

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Insert default plans with configurable features
INSERT INTO plans (name, slug, price_cents, features) VALUES
('Básico', 'basic', 0, '["user_management", "basic_dashboard"]'::jsonb),
('Profissional', 'professional', 2900, '["user_management", "basic_dashboard", "advanced_reports", "api_access", "priority_support"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

\echo '✅ Default billing plans created'

-- ============================================================================
-- FINALIZATION
-- ============================================================================

-- Record this migration
INSERT INTO schema_versions (version, description) 
VALUES (1, 'Complete consolidated schema: users, organizations, members, invites, billing, sessions, 2FA, preferences')
ON CONFLICT (version) DO NOTHING;

\echo '🎉 Complete consolidated schema created successfully!'
\echo ''
\echo '📋 Schema Summary:'
\echo '   ✅ Users table with full authentication'
\echo '   ✅ Organizations with multi-tenancy support'
\echo '   ✅ Organization members with role-based access'
\echo '   ✅ Organization invites system'
\echo '   ✅ User sessions management with security'
\echo '   ✅ Two-factor authentication with TOTP'
\echo '   ✅ User preferences with comprehensive settings'
\echo '   ✅ Billing system with plans and subscriptions'
\echo '   ✅ All indexes and constraints applied'
\echo '   ✅ Utility functions for maintenance'
\echo ''
\echo '🔗 Ready for: make setup && npm run dev'