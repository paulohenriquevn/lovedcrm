-- =============================================
-- 006_communication_enhancement.sql
-- Enhanced Communication Tables
-- Sistema: Next.js 14 + FastAPI + PostgreSQL
-- Multi-tenancy: organization_id isolation
-- =============================================

\echo '🚀 Creating enhanced communication tables...'

-- Message templates para agilizar comunicação
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- greeting, follow-up, objection, closing
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]', -- [{{lead_name}}, {{company}}, {{value}}]
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_category CHECK (category IN ('greeting', 'follow-up', 'objection', 'closing', 'custom'))
);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_message_templates_org_id ON message_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_org_category ON message_templates(organization_id, category);
CREATE INDEX IF NOT EXISTS idx_message_templates_org_active ON message_templates(organization_id, is_active);

\echo '✅ Message templates table created'

-- Analytics de performance dos templates
CREATE TABLE IF NOT EXISTS template_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES message_templates(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ DEFAULT NOW(),
    success_metric VARCHAR(50), -- response_received, lead_advanced, meeting_scheduled
    success_value BOOLEAN,
    response_time_minutes INTEGER, -- tempo até resposta (se aplicável)
    
    CONSTRAINT valid_success_metric CHECK (success_metric IN ('response_received', 'lead_advanced', 'meeting_scheduled', 'deal_closed', 'custom'))
);

-- Indexes para analytics
CREATE INDEX IF NOT EXISTS idx_template_usage_org_template ON template_usage_stats(organization_id, template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_org_used_at ON template_usage_stats(organization_id, used_at DESC);
CREATE INDEX IF NOT EXISTS idx_template_usage_success ON template_usage_stats(organization_id, success_metric, success_value);

\echo '✅ Template usage stats table created'

-- VoIP dual provider configuration (Twilio + Telnyx cost optimization)
CREATE TABLE IF NOT EXISTS voip_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL, -- twilio, telnyx
    is_active BOOLEAN DEFAULT TRUE,
    phone_number VARCHAR(50),
    api_credentials JSONB, -- encrypted credentials
    cost_per_minute DECIMAL(8,4), -- cost tracking
    setup_completed BOOLEAN DEFAULT FALSE,
    last_test_call_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_provider CHECK (provider IN ('twilio', 'telnyx', 'custom')),
    CONSTRAINT unique_org_provider UNIQUE (organization_id, provider)
);

-- Indexes para VoIP
CREATE INDEX IF NOT EXISTS idx_voip_configs_org_id ON voip_configs(organization_id);
CREATE INDEX IF NOT EXISTS idx_voip_configs_org_active ON voip_configs(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_voip_configs_provider ON voip_configs(provider);

\echo '✅ VoIP configs table created'

-- Update schema version
INSERT INTO schema_versions (version, description) 
VALUES (6, 'Enhanced communication tables: message_templates, template_usage_stats, voip_configs')
ON CONFLICT (version) DO NOTHING;

\echo '🎉 Communication enhancement tables completed!'