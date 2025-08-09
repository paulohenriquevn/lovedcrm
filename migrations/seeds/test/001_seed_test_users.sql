-- =============================================
-- Test Environment Seeds - Test Users  
-- =============================================
-- Version: 1
-- Environment: Test
-- Description: Creates minimal test users for E2E testing
-- Depends: 001_consolidated_schema.sql
-- Note: Tests usually create their own data via fixtures
-- =============================================

\echo '🧪 Seeding test environment base data...'

-- Create minimal test organization
INSERT INTO organizations (
    id,
    name,
    slug,
    description,
    is_active,
    is_verified
) VALUES 
(
    'test-org-0000-0000-0000-000000000000',
    'Test Organization',
    'test-organization',
    'Organization for E2E testing',
    true,
    true
)
ON CONFLICT (id) DO NOTHING;

-- Create test user
-- Password: TestPassword123!
INSERT INTO users (
    id,
    email,
    hashed_password,
    full_name,
    is_active,
    is_verified,
    is_superuser
) VALUES 
(
    'test-user-0000-0000-0000-000000000000',
    'test@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewI.CuqmpajjO7BG',
    'Test User',
    true,
    true,
    false
)
ON CONFLICT (id) DO NOTHING;

-- Assign ownership
UPDATE organizations SET owner_id = 'test-user-0000-0000-0000-000000000000' 
WHERE id = 'test-org-0000-0000-0000-000000000000';

-- Create membership
INSERT INTO organization_members (
    organization_id,
    user_id,
    role,
    is_active
) VALUES 
('test-org-0000-0000-0000-000000000000', 'test-user-0000-0000-0000-000000000000', 'owner', true)
ON CONFLICT (organization_id, user_id) DO NOTHING;

\echo '✅ Test environment seeded successfully'

-- Record seed version
INSERT INTO seed_versions (version, description, environment)
VALUES (1, 'Base test users and organization', 'test')
ON CONFLICT (version, environment) DO NOTHING;

\echo '📝 Seed version 1 recorded for test environment'