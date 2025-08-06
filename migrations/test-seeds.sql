-- Test Seeds - Simplified for test environment

\echo '🧪 Loading test seeds...'

-- Minimal test data for automated testing
INSERT INTO users (
    id, email, hashed_password, full_name, is_active, is_verified, created_at
) VALUES 
(
    '12345678-0000-0000-0000-000000000001'::uuid,
    'test@example.com',
    crypt('testpass123', gen_salt('bf')),
    'Test User',
    true,
    true,
    NOW()
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO organizations (
    id, name, slug, description, owner_id, is_active, created_at
) VALUES 
(
    '87654321-0000-0000-0000-000000000001'::uuid,
    'Test Organization',
    'test-org',
    'Organization for automated testing',
    '12345678-0000-0000-0000-000000000001'::uuid,
    true,
    NOW()
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO organization_members (
    user_id, organization_id, role, is_active, created_at
) VALUES 
(
    '12345678-0000-0000-0000-000000000001'::uuid,
    '87654321-0000-0000-0000-000000000001'::uuid,
    'owner'::organization_role,
    true,
    NOW()
)
ON CONFLICT (user_id, organization_id) DO NOTHING;

-- Add additional test users for role testing
INSERT INTO users (
    id, email, hashed_password, full_name, is_active, is_verified, created_at
) VALUES 
(
    '12345678-0000-0000-0000-000000000002'::uuid,
    'admin@example.com',
    crypt('testpass123', gen_salt('bf')),
    'Test Admin',
    true,
    true,
    NOW()
),
(
    '12345678-0000-0000-0000-000000000003'::uuid,
    'member@example.com',
    crypt('testpass123', gen_salt('bf')),
    'Test Member',
    true,
    true,
    NOW()
),
(
    '12345678-0000-0000-0000-000000000004'::uuid,
    'viewer@example.com',
    crypt('testpass123', gen_salt('bf')),
    'Test Viewer',
    true,
    true,
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Add members with different roles
INSERT INTO organization_members (
    user_id, organization_id, role, is_active, created_at
) VALUES 
(
    '12345678-0000-0000-0000-000000000002'::uuid,
    '87654321-0000-0000-0000-000000000001'::uuid,
    'admin'::organization_role,
    true,
    NOW()
),
(
    '12345678-0000-0000-0000-000000000003'::uuid,
    '87654321-0000-0000-0000-000000000001'::uuid,
    'member'::organization_role,
    true,
    NOW()
),
(
    '12345678-0000-0000-0000-000000000004'::uuid,
    '87654321-0000-0000-0000-000000000001'::uuid,
    'viewer'::organization_role,
    true,
    NOW()
)
ON CONFLICT (user_id, organization_id) DO NOTHING;

-- Add test invites
INSERT INTO organization_invites (
    id, organization_id, invited_by_id, email, role, status, message, token, created_at, expires_at
) VALUES 
(
    '11111111-0000-0000-0000-000000000001'::uuid,
    '87654321-0000-0000-0000-000000000001'::uuid,
    '12345678-0000-0000-0000-000000000001'::uuid,
    'pending@example.com',
    'member'::organization_role,
    'pending'::invite_status,
    'Welcome to our team!',
    'test_invite_token_123456789',
    NOW(),
    NOW() + INTERVAL '7 days'
),
(
    '11111111-0000-0000-0000-000000000002'::uuid,
    '87654321-0000-0000-0000-000000000001'::uuid,
    '12345678-0000-0000-0000-000000000002'::uuid,
    'expired@example.com',
    'viewer'::organization_role,
    'expired'::invite_status,
    'This invite has expired',
    'test_expired_token_123456789',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '3 days'
)
ON CONFLICT (token) DO NOTHING;

\echo '✅ Test seeds loaded successfully'