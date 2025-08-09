-- =============================================
-- Dev Environment Seeds - Development Users
-- =============================================
-- Version: 2
-- Environment: Development
-- Description: Creates development users and assigns organization ownership
-- Depends: 001_seed_base_orgs.sql
-- =============================================

\echo '🌱 Seeding development users...'

-- Create development users with correct column names
-- Password for all dev users: DevPassword123!
-- Hashed with bcrypt
INSERT INTO users (
    id,
    email,
    hashed_password,
    full_name,
    bio,
    location,
    phone,
    timezone,
    language,
    is_active,
    is_verified,
    is_superuser
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'admin@exemplo.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewI.CuqmpajjO7BG', -- DevPassword123!
    'Admin Sistema',
    'Administrador do sistema CRM para desenvolvimento',
    'São Paulo, SP',
    '+55 11 99999-0001',
    'America/Sao_Paulo',
    'pt',
    true,
    true,
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'gerente@exemplo.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewI.CuqmpajjO7BG', -- DevPassword123!
    'Maria Silva Gerente',
    'Gerente de Marketing Digital especializada em lead generation',
    'Rio de Janeiro, RJ',
    '+55 21 99999-0002',
    'America/Sao_Paulo',
    'pt',
    true,
    true,
    false
),
(
    '33333333-3333-3333-3333-333333333333',
    'consultor@exemplo.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewI.CuqmpajjO7BG', -- DevPassword123!
    'João Santos Consultor',
    'Consultor CRM com 10 anos de experiência em implementação',
    'Belo Horizonte, MG',
    '+55 31 99999-0003',
    'America/Sao_Paulo',
    'pt',
    true,
    true,
    false
)
ON CONFLICT (id) DO NOTHING;

\echo '✅ Development users seeded successfully'

-- Update organizations to set owners
UPDATE organizations SET owner_id = '11111111-1111-1111-1111-111111111111' 
WHERE id = '01010101-0101-0101-0101-010101010101';

UPDATE organizations SET owner_id = '22222222-2222-2222-2222-222222222222' 
WHERE id = '02020202-0202-0202-0202-020202020202';

UPDATE organizations SET owner_id = '33333333-3333-3333-3333-333333333333' 
WHERE id = '03030303-0303-0303-0303-030303030303';

\echo '🔗 Organization ownership assigned'

-- Create organization memberships
INSERT INTO organization_members (
    organization_id,
    user_id,
    role,
    is_active
) VALUES 
-- Admin Sistema owner da primeira org
('01010101-0101-0101-0101-010101010101', '11111111-1111-1111-1111-111111111111', 'owner', true),
-- Maria Silva owner da segunda org
('02020202-0202-0202-0202-020202020202', '22222222-2222-2222-2222-222222222222', 'owner', true),
-- João Santos owner da terceira org
('03030303-0303-0303-0303-030303030303', '33333333-3333-3333-3333-333333333333', 'owner', true),
-- Cross-memberships for testing
('01010101-0101-0101-0101-010101010101', '22222222-2222-2222-2222-222222222222', 'member', true),
('02020202-0202-0202-0202-020202020202', '33333333-3333-3333-3333-333333333333', 'admin', true)
ON CONFLICT (organization_id, user_id) DO NOTHING;

\echo '👥 Organization memberships created'

-- Record seed version
INSERT INTO seed_versions (version, description, environment)
VALUES (2, 'Development users and organization ownership', 'dev')
ON CONFLICT (version, environment) DO NOTHING;

\echo '📝 Seed version 2 recorded for dev environment'