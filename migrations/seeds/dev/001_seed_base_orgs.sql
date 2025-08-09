-- =============================================
-- Dev Environment Seeds - Base Organizations
-- =============================================
-- Version: 1
-- Environment: Development
-- Description: Creates base organizations for development environment
-- Depends: 001_consolidated_schema.sql
-- =============================================

\echo '🌱 Seeding base organizations for development...'

-- Create base development organizations
-- NOTE: owner_id is nullable and will be set when users are created
INSERT INTO organizations (
    id,
    name,
    slug,
    description,
    website,
    industry,
    company_size,
    is_active,
    is_verified
) VALUES 
(
    '01010101-0101-0101-0101-010101010101',
    'Agência Digital Exemplo',
    'agencia-digital-exemplo',
    'Agência especializada em marketing digital e desenvolvimento web',
    'https://exemplo.com',
    'Marketing Digital',
    '11-50',
    true,
    true
),
(
    '02020202-0202-0202-0202-020202020202',
    'Startup Tech Brasil',
    'startup-tech-brasil',
    'Startup focada em soluções tecnológicas inovadoras',
    'https://startuptech.com.br',
    'Tecnologia',
    '1-10',
    true,
    false
),
(
    '03030303-0303-0303-0303-030303030303',
    'Consultoria CRM Pro',
    'consultoria-crm-pro',
    'Consultoria especializada em implementação de sistemas CRM',
    'https://crmproagencia.com',
    'Consultoria',
    '51-200',
    true,
    true
)
ON CONFLICT (id) DO NOTHING;

\echo '✅ Base organizations seeded successfully'

-- Record seed version
INSERT INTO seed_versions (version, description, environment)
VALUES (1, 'Base organizations for development', 'dev')
ON CONFLICT (version, environment) DO NOTHING;

\echo '📝 Seed version 1 recorded for dev environment'