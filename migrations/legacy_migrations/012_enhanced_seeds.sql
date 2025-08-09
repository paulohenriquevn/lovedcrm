-- =============================================
-- 012_enhanced_seeds.sql
-- Enhanced Seeds for New Tables  
-- Sistema: SQL-based seeding following project patterns
-- Multi-tenancy: Organization-specific default data
-- =============================================

\echo '🌱 Creating enhanced seeds for new tables...'

-- =============================================
-- MESSAGE TEMPLATES SEEDS
-- =============================================

-- Create message templates for existing organizations
CREATE OR REPLACE FUNCTION seed_message_templates() 
RETURNS text 
LANGUAGE plpgsql 
AS $$
DECLARE
    org_record RECORD;
    result_msg text := '';
BEGIN
    \echo '📝 Creating default message templates for all organizations...';
    
    -- Loop through all organizations and create default templates
    FOR org_record IN SELECT id FROM organizations LOOP
        
        -- Greeting templates
        INSERT INTO message_templates (
            organization_id, name, category, content, variables, is_active
        ) VALUES
        (
            org_record.id,
            'Saudação Inicial',
            'greeting',
            'Olá {{lead_name}}! 👋 Obrigado pelo interesse em nossos serviços. Como posso ajudar você hoje?',
            '["{{lead_name}}"]'::jsonb,
            true
        ),
        (
            org_record.id,
            'Boas-vindas WhatsApp',
            'greeting', 
            'Oi {{lead_name}}! Seja bem-vindo(a)! 🎉 Recebi seu contato e estou aqui para esclarecer todas suas dúvidas sobre {{company}}.',
            '["{{lead_name}}", "{{company}}"]'::jsonb,
            true
        ),
        
        -- Follow-up templates
        (
            org_record.id,
            'Follow-up 24h',
            'follow-up',
            'Oi {{lead_name}}! 📞 Estou entrando em contato para dar continuidade à nossa conversa sobre {{company}}. Tem alguns minutos para conversarmos?',
            '["{{lead_name}}", "{{company}}"]'::jsonb,
            true
        ),
        (
            org_record.id,
            'Follow-up Proposta',
            'follow-up',
            'Olá {{lead_name}}! Enviei uma proposta personalizada para {{company}} no valor de {{value}}. Conseguiu dar uma olhada? 📋',
            '["{{lead_name}}", "{{company}}", "{{value}}"]'::jsonb,
            true
        ),
        
        -- Objection handling templates
        (
            org_record.id,
            'Preço Alto - Objeção',
            'objection',
            'Entendo sua preocupação com o investimento, {{lead_name}}. Que tal conversarmos sobre as opções de pagamento e ROI esperado para {{company}}? 💰',
            '["{{lead_name}}", "{{company}}"]'::jsonb,
            true
        ),
        (
            org_record.id,
            'Preciso Pensar',
            'objection',
            'Claro, {{lead_name}}! É uma decisão importante. Posso enviar alguns cases de sucesso similares ao {{company}} para ajudar na análise? 🤔',
            '["{{lead_name}}", "{{company}}"]'::jsonb,
            true
        ),
        
        -- Closing templates
        (
            org_record.id,
            'Fechamento Proposta',
            'closing',
            'Perfeito, {{lead_name}}! 🎯 Para finalizar a proposta para {{company}}, preciso apenas de confirmação sobre o cronograma. Podemos seguir?',
            '["{{lead_name}}", "{{company}}"]'::jsonb,
            true
        ),
        (
            org_record.id,
            'Agendamento Reunião',
            'closing',
            'Ótimo, {{lead_name}}! Que tal agendarmos uma reunião para alinhar os detalhes finais do projeto {{company}}? Tem preferência de horário? 📅',
            '["{{lead_name}}", "{{company}}"]'::jsonb,
            true
        )
        
        ON CONFLICT DO NOTHING;
        
    END LOOP;
    
    result_msg := 'Message templates seeded for all organizations';
    \echo '✅ Message templates seeded successfully';
    RETURN result_msg;
END;
$$;

SELECT seed_message_templates();

-- =============================================
-- VOIP CONFIGS SEEDS
-- =============================================

-- Create default VoIP configurations
CREATE OR REPLACE FUNCTION seed_voip_configs() 
RETURNS text 
LANGUAGE plpgsql 
AS $$
DECLARE
    org_record RECORD;
    result_msg text := '';
BEGIN
    \echo '📞 Creating default VoIP configurations for all organizations...';
    
    FOR org_record IN SELECT id FROM organizations LOOP
        
        -- Telnyx configuration (cost-effective option)
        INSERT INTO voip_configs (
            organization_id, provider, is_active, cost_per_minute, setup_completed
        ) VALUES
        (
            org_record.id,
            'telnyx',
            false, -- Disabled by default, requires setup
            0.004, -- $0.004 per minute (Telnyx pricing)
            false
        ),
        
        -- Twilio configuration (premium option)
        (
            org_record.id,
            'twilio',
            false, -- Disabled by default, requires setup
            0.013, -- $0.013 per minute (Twilio pricing)
            false
        )
        
        ON CONFLICT (organization_id, provider) DO NOTHING;
        
    END LOOP;
    
    result_msg := 'VoIP configurations seeded for all organizations';
    \echo '✅ VoIP configurations seeded successfully';
    RETURN result_msg;
END;
$$;

SELECT seed_voip_configs();

-- =============================================
-- LEAD SCORING MODELS SEEDS
-- =============================================

-- Create default lead scoring models
CREATE OR REPLACE FUNCTION seed_lead_scoring_models() 
RETURNS text 
LANGUAGE plpgsql 
AS $$
DECLARE
    org_record RECORD;
    result_msg text := '';
BEGIN
    \echo '🎯 Creating default lead scoring models for all organizations...';
    
    FOR org_record IN SELECT id FROM organizations LOOP
        
        INSERT INTO lead_scoring_models (
            organization_id, model_name, model_version, model_config, 
            accuracy_score, is_active, trained_at
        ) VALUES
        (
            org_record.id,
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
        )
        
        ON CONFLICT (organization_id, model_name, is_active) DO NOTHING;
        
    END LOOP;
    
    result_msg := 'Lead scoring models seeded for all organizations';
    \echo '✅ Lead scoring models seeded successfully';
    RETURN result_msg;
END;
$$;

SELECT seed_lead_scoring_models();

-- =============================================
-- WEBHOOK SUBSCRIPTIONS SEEDS
-- =============================================

-- Create common webhook subscriptions
CREATE OR REPLACE FUNCTION seed_webhook_subscriptions() 
RETURNS text 
LANGUAGE plpgsql 
AS $$
DECLARE
    org_record RECORD;
    result_msg text := '';
BEGIN
    \echo '🔗 Creating default webhook subscriptions for all organizations...';
    
    FOR org_record IN SELECT id FROM organizations LOOP
        
        -- Stripe webhook (for billing)
        INSERT INTO webhook_subscriptions (
            organization_id, webhook_url, events, provider, is_active
        ) VALUES
        (
            org_record.id,
            'https://api.lovedcrm.com/webhooks/stripe',
            '["invoice.payment_succeeded", "invoice.payment_failed", "customer.subscription.updated", "customer.subscription.deleted"]'::jsonb,
            'stripe',
            false -- Disabled by default, requires configuration
        )
        
        ON CONFLICT (organization_id, provider, webhook_url) DO NOTHING;
        
    END LOOP;
    
    result_msg := 'Webhook subscriptions seeded for all organizations';
    \echo '✅ Webhook subscriptions seeded successfully';
    RETURN result_msg;
END;
$$;

SELECT seed_webhook_subscriptions();

-- =============================================
-- BACKGROUND JOBS SEEDS
-- =============================================

-- Create sample background jobs for testing
INSERT INTO background_jobs (
    organization_id, job_type, job_data, priority, status
) VALUES
(
    (SELECT id FROM organizations LIMIT 1),
    'data_export',
    '{"format": "csv", "table": "leads", "filters": {}}'::jsonb,
    5,
    'completed'
),
(
    (SELECT id FROM organizations LIMIT 1),
    'email_campaign',
    '{"template_id": "welcome", "recipient_count": 150}'::jsonb,
    3,
    'completed'
)
ON CONFLICT DO NOTHING;

-- Update schema version
INSERT INTO schema_versions (version, description) 
VALUES (12, 'Enhanced seeds: Default data for message_templates, voip_configs, lead_scoring_models, webhook_subscriptions')
ON CONFLICT (version) DO NOTHING;

\echo '🌱 Enhanced seeds completed - All organizations have default data!'