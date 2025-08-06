-- test-setup.sql
-- Setup script for test database with sample data

-- Clear existing data (for clean tests)
TRUNCATE organization_members, organizations, users CASCADE;

-- Insert test users with proper bcrypt hashes
INSERT INTO users (id, email, hashed_password, full_name, is_active, is_verified, created_at) VALUES
('12345678-0000-0000-0000-000000000001', 'test@example.com', crypt('testpass123', gen_salt('bf')), 'Test User', true, true, NOW()),
('12345678-0000-0000-0000-000000000002', 'admin@example.com', crypt('testpass123', gen_salt('bf')), 'Test Admin', true, true, NOW()),
('12345678-0000-0000-0000-000000000003', 'member@example.com', crypt('testpass123', gen_salt('bf')), 'Test Member', true, true, NOW()),
('12345678-0000-0000-0000-000000000004', 'viewer@example.com', crypt('testpass123', gen_salt('bf')), 'Test Viewer', true, true, NOW());

-- Insert test organizations
INSERT INTO organizations (id, name, slug, description, owner_id, is_active, created_at) VALUES
('87654321-0000-0000-0000-000000000001', 'Test Organization', 'test-org', 'Organization for automated testing', '12345678-0000-0000-0000-000000000001', true, NOW());

-- Insert organization memberships with proper roles
INSERT INTO organization_members (user_id, organization_id, role, is_active, created_at) VALUES
('12345678-0000-0000-0000-000000000001', '87654321-0000-0000-0000-000000000001', 'owner', true, NOW()),
('12345678-0000-0000-0000-000000000002', '87654321-0000-0000-0000-000000000001', 'admin', true, NOW()),
('12345678-0000-0000-0000-000000000003', '87654321-0000-0000-0000-000000000001', 'member', true, NOW()),
('12345678-0000-0000-0000-000000000004', '87654321-0000-0000-0000-000000000001', 'viewer', true, NOW());

-- Insert test invites
INSERT INTO organization_invites (id, organization_id, invited_by_id, email, role, status, message, token, created_at, expires_at) VALUES
('11111111-0000-0000-0000-000000000001', '87654321-0000-0000-0000-000000000001', '12345678-0000-0000-0000-000000000001', 'pending@example.com', 'member', 'pending', 'Welcome to our team!', 'test_invite_token_123456789', NOW(), NOW() + INTERVAL '7 days'),
('11111111-0000-0000-0000-000000000002', '87654321-0000-0000-0000-000000000001', '12345678-0000-0000-0000-000000000002', 'expired@example.com', 'viewer', 'expired', 'This invite has expired', 'test_expired_token_123456789', NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days');

-- Set schema version to latest for tests
INSERT INTO schema_versions (version, description) 
VALUES (4, 'Test setup with invite system')
ON CONFLICT (version) DO NOTHING;