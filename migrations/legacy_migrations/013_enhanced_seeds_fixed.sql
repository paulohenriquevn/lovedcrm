-- =============================================
-- 013_enhanced_seeds_fixed.sql
-- Enhanced Seeds for New Tables (Fixed)
-- Sistema: SQL-based seeding following project patterns
-- Multi-tenancy: Organization-specific default data
-- =============================================

\echo '🌱 Creating enhanced seeds for new tables...'

-- =============================================
-- MESSAGE TEMPLATES SEEDS
-- =============================================

-- Create message templates for existing organizations
\echo '📝 Creating default message templates for all organizations...';

INSERT INTO message_templates (
    organization_id, name, category, content, variables, is_active
)
SELECT 
    o.id as organization_id,
    template.name,
    template.category,
    template.content,
    template.variables::jsonb,
    true
FROM organizations o
CROSS JOIN (
    VALUES 
    ('Saudação Inicial', 'greeting', 'Olá {{lead_name}}! 👋 Obrigado pelo interesse em nossos serviços. Como posso ajudar você hoje?', '["{{lead_name}}"]'),
    ('Boas-vindas WhatsApp', 'greeting', 'Oi {{lead_name}}! Seja bem-vindo(a)! 🎉 Recebi seu contato e estou aqui para esclarecer todas suas dúvidas sobre {{company}}.', '["{{lead_name}}", "{{company}}"]'),
    ('Follow-up 24h', 'follow-up', 'Oi {{lead_name}}! 📞 Estou entrando em contato para dar continuidade à nossa conversa sobre {{company}}. Tem alguns minutos para conversarmos?', '["{{lead_name}}", "{{company}}"]'),
    ('Follow-up Proposta', 'follow-up', 'Olá {{lead_name}}! Enviei uma proposta personalizada para {{company}} no valor de {{value}}. Conseguiu dar uma olhada? 📋', '["{{lead_name}}", "{{company}}", "{{value}}"]'),
    ('Preço Alto - Objeção', 'objection', 'Entendo sua preocupação com o investimento, {{lead_name}}. Que tal conversarmos sobre as opções de pagamento e ROI esperado para {{company}}? 💰', '["{{lead_name}}", "{{company}}"]'),
    ('Preciso Pensar', 'objection', 'Claro, {{lead_name}}! É uma decisão importante. Posso enviar alguns cases de sucesso similares ao {{company}} para ajudar na análise? 🤔', '["{{lead_name}}", "{{company}}"]'),
    ('Fechamento Proposta', 'closing', 'Perfeito, {{lead_name}}! 🎯 Para finalizar a proposta para {{company}}, preciso apenas de confirmação sobre o cronograma. Podemos seguir?', '["{{lead_name}}", "{{company}}"]'),
    ('Agendamento Reunião', 'closing', 'Ótimo, {{lead_name}}! Que tal agendarmos uma reunião para alinhar os detalhes finais do projeto {{company}}? Tem preferência de horário? 📅', '["{{lead_name}}", "{{company}}"]')
) as template(name, category, content, variables)
ON CONFLICT DO NOTHING;

\echo '✅ Message templates seeded successfully';

-- =============================================
-- VOIP CONFIGS SEEDS  
-- =============================================

\echo '📞 Creating default VoIP configurations for all organizations...';

INSERT INTO voip_configs (
    organization_id, provider, is_active, cost_per_minute, setup_completed
)
SELECT 
    o.id as organization_id,
    voip.provider,
    false, -- Disabled by default, requires setup
    voip.cost_per_minute,
    false
FROM organizations o
CROSS JOIN (
    VALUES 
    ('telnyx', 0.004), -- $0.004 per minute (cost-effective)
    ('twilio', 0.013)  -- $0.013 per minute (premium)
) as voip(provider, cost_per_minute)
ON CONFLICT (organization_id, provider) DO NOTHING;

\echo '✅ VoIP configurations seeded successfully';

-- =============================================  
-- LEAD SCORING MODELS SEEDS
-- =============================================

\echo '🎯 Creating default lead scoring models for all organizations...';

INSERT INTO lead_scoring_models (
    organization_id, model_name, model_version, model_config, 
    accuracy_score, is_active, trained_at
)
SELECT 
    o.id as organization_id,
    'Default Scoring Model',
    'v1.0',
    '{
        "features": ["email_domain", "company_size", "budget_range", "urgency_level"],
        "weights": {"email_domain": 0.2, "company_size": 0.3, "budget_range": 0.3, "urgency_level": 0.2},
        "thresholds": {"hot": 80, "warm": 60, "cold": 40}
    }'::jsonb,
    0.7500, -- 75% accuracy baseline
    true, -- Active by default
    NOW()
FROM organizations o
ON CONFLICT (organization_id, model_name, is_active) DO NOTHING;

\echo '✅ Lead scoring models seeded successfully';

-- =============================================
-- WEBHOOK SUBSCRIPTIONS SEEDS
-- =============================================

\echo '🔗 Creating default webhook subscriptions for all organizations...';

INSERT INTO webhook_subscriptions (
    organization_id, webhook_url, events, provider, is_active
)
SELECT 
    o.id as organization_id,
    'https://api.lovedcrm.com/webhooks/stripe',
    '["invoice.payment_succeeded", "invoice.payment_failed", "customer.subscription.updated", "customer.subscription.deleted"]'::jsonb,
    'stripe',
    false -- Disabled by default, requires configuration
FROM organizations o
ON CONFLICT (organization_id, provider, webhook_url) DO NOTHING;

\echo '✅ Webhook subscriptions seeded successfully';

-- =============================================
-- SAMPLE BACKGROUND JOBS
-- =============================================

\echo '⚙️ Creating sample background jobs...';

INSERT INTO background_jobs (
    organization_id, job_type, job_data, priority, status, completed_at
) VALUES
(
    (SELECT id FROM organizations LIMIT 1),
    'data_export',
    '{"format": "csv", "table": "leads", "filters": {}}'::jsonb,
    5,
    'completed',
    NOW() - INTERVAL '2 hours'
),
(
    (SELECT id FROM organizations LIMIT 1),
    'email_campaign',
    '{"template_id": "welcome", "recipient_count": 150}'::jsonb,
    3,
    'completed',
    NOW() - INTERVAL '1 hour'
),
(
    (SELECT id FROM organizations LIMIT 1),
    'lead_scoring_update',
    '{"model_id": "default", "batch_size": 100}'::jsonb,
    4,
    'pending',
    NULL
)
ON CONFLICT DO NOTHING;

\echo '✅ Sample background jobs created';

-- Update schema version
INSERT INTO schema_versions (version, description) 
VALUES (13, 'Enhanced seeds (fixed): Default data for message_templates, voip_configs, lead_scoring_models, webhook_subscriptions, background_jobs')
ON CONFLICT (version) DO NOTHING;

\echo '🌱 Enhanced seeds completed - All organizations have default data!'