-- =============================================
-- Production Environment Seeds - Production Base
-- =============================================
-- Version: 1
-- Environment: Production
-- Description: Creates minimal production setup (plans only)
-- Depends: 001_consolidated_schema.sql
-- Note: Production users should register normally
-- =============================================

\echo '🏭 Seeding production base data...'

-- Ensure billing plans are created (they should already exist from migration)
-- This is a safety check for production environment
INSERT INTO plans (name, slug, price_cents, features) VALUES
('Básico', 'basic', 0, '[
    "user_management", 
    "basic_dashboard", 
    "up_to_100_leads", 
    "email_support"
]'::jsonb),
('Profissional', 'professional', 2900, '[
    "user_management", 
    "advanced_dashboard", 
    "unlimited_leads", 
    "advanced_reports", 
    "api_access", 
    "priority_support", 
    "integrations"
]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

\echo '💳 Billing plans verified for production'

-- Record seed version
INSERT INTO seed_versions (version, description, environment)
VALUES (1, 'Production base setup with billing plans', 'prod')
ON CONFLICT (version, environment) DO NOTHING;

\echo '📝 Seed version 1 recorded for prod environment'
\echo '🚀 Production environment ready for user registration'