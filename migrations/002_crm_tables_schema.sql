-- =============================================
-- 002_crm_tables_schema.sql
-- SCRIPT MIGRAÇÃO COMPLETA - LOVED CRM
-- Sistema: Next.js 14 + FastAPI + PostgreSQL + Railway
-- Isolamento: organization_id + api/core/organization_middleware.py + api/repositories/base.py
-- Baseado em: docs/project/04-database.md
-- =============================================

\echo '🚀 Creating CRM tables schema with organizational isolation...'

-- ============================================================================
-- CRM CORE TABLES
-- ============================================================================

-- Leads table (entidade principal CRM)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    stage VARCHAR(50) NOT NULL DEFAULT 'lead'
        CHECK (stage IN ('lead', 'contato', 'proposta', 'negociacao', 'fechado')),
    source VARCHAR(100) DEFAULT 'web',
    estimated_value DECIMAL(12,2),
    tags TEXT[],
    assigned_user_id UUID REFERENCES users(id),
    last_contact_at TIMESTAMPTZ,
    last_contact_channel VARCHAR(20),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

\echo '✅ Leads table created'

-- Communications table (timeline unificada)
CREATE TABLE IF NOT EXISTS communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL, -- 'whatsapp', 'email', 'voip', 'note'
    direction VARCHAR(10) NOT NULL, -- 'inbound', 'outbound'
    content TEXT NOT NULL,
    subject VARCHAR(500), -- Para emails
    metadata JSONB DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    external_id VARCHAR(255), -- ID externo (WhatsApp msg ID, Email ID, etc)
    status VARCHAR(20) DEFAULT 'delivered',
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

\echo '✅ Communications table created'

-- AI Summaries table (resumos automáticos)
CREATE TABLE IF NOT EXISTS ai_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL,  -- Group related communications
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    sentiment VARCHAR(20),
    next_actions TEXT[],
    confidence_score DECIMAL(3,2),
    model_used VARCHAR(50) DEFAULT 'gpt-4',
    tokens_used INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

\echo '✅ AI Summaries table created'

-- ============================================================================
-- INTEGRATIONS TABLES
-- ============================================================================

-- Organization integrations (WhatsApp, VoIP, Email)
CREATE TABLE IF NOT EXISTS organization_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'whatsapp', 'gmail', 'twilio', 'outlook'
    encrypted_credentials TEXT NOT NULL, -- JSON encrypted com chaves API
    webhook_secret VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'error', 'pending')),
    metadata JSONB DEFAULT '{}',
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Uma integração por provider por organização
    UNIQUE(organization_id, provider)
);

\echo '✅ Organization Integrations table created'

-- ============================================================================
-- SUPPORT TABLES
-- ============================================================================

-- File attachments (mídia e documentos)
CREATE TABLE IF NOT EXISTS file_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    communication_id UUID REFERENCES communications(id) ON DELETE CASCADE,
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500),
    file_size BIGINT,
    content_type VARCHAR(100),
    storage_path TEXT NOT NULL,
    storage_type VARCHAR(20) DEFAULT 'minio', -- 'minio', 'railway_volume'
    is_encrypted BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

\echo '✅ File Attachments table created'

-- Audit logs com escopo organizacional
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

\echo '✅ Audit Logs table created'

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Leads indexes
CREATE INDEX IF NOT EXISTS idx_leads_org_id ON leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_stage ON leads(organization_id, stage);
CREATE INDEX IF NOT EXISTS idx_leads_org_assigned ON leads(organization_id, assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_created ON leads(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_org_stage_created ON leads(organization_id, stage, created_at DESC);

\echo '✅ Leads indexes created'

-- Communications indexes  
CREATE INDEX IF NOT EXISTS idx_communications_org_id ON communications(organization_id);
CREATE INDEX IF NOT EXISTS idx_communications_org_lead ON communications(organization_id, lead_id);
CREATE INDEX IF NOT EXISTS idx_communications_timeline ON communications(organization_id, lead_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_communications_external_id ON communications(external_id);
CREATE INDEX IF NOT EXISTS idx_communications_channel ON communications(organization_id, channel);

\echo '✅ Communications indexes created'

-- AI summaries indexes
CREATE INDEX IF NOT EXISTS idx_ai_summaries_org_id ON ai_summaries(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_conversation ON ai_summaries(organization_id, conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_lead ON ai_summaries(organization_id, lead_id);

\echo '✅ AI Summaries indexes created'

-- Integrations indexes
CREATE INDEX IF NOT EXISTS idx_org_integrations_org_id ON organization_integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_integrations_provider ON organization_integrations(provider, status);

\echo '✅ Organization Integrations indexes created'

-- File attachments indexes
CREATE INDEX IF NOT EXISTS idx_file_attachments_org_id ON file_attachments(organization_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_comm_id ON file_attachments(communication_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_storage ON file_attachments(storage_type, storage_path);

\echo '✅ File Attachments indexes created'

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_org_table ON audit_logs(organization_id, table_name);
CREATE INDEX IF NOT EXISTS idx_audit_org_record ON audit_logs(organization_id, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_org_created ON audit_logs(organization_id, created_at DESC);

\echo '✅ Audit Logs indexes created'

-- ============================================================================
-- CRM FEATURE GATING FUNCTIONS
-- ============================================================================

-- Verificar se organização tem acesso funcionalidade CRM
CREATE OR REPLACE FUNCTION has_crm_feature_access(
    feature_name VARCHAR,
    org_uuid UUID DEFAULT current_setting('app.current_org_id', true)::UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    org_tier VARCHAR(20);
    feature_available BOOLEAN DEFAULT FALSE;
BEGIN
    -- Verificar se org_uuid é válido
    IF org_uuid IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Obter tier assinatura organização
    SELECT tier INTO org_tier
    FROM subscriptions s
    WHERE s.organization_id = org_uuid;

    -- Se não encontrou subscription, assumir free
    IF org_tier IS NULL THEN
        org_tier := 'free';
    END IF;

    -- Lógica feature gate CRM
    CASE
        WHEN feature_name = 'whatsapp_integration' AND org_tier IN ('pro', 'enterprise') THEN
            feature_available := TRUE;
        WHEN feature_name = 'voip_integration' AND org_tier = 'enterprise' THEN
            feature_available := TRUE;
        WHEN feature_name = 'ai_summaries' AND org_tier IN ('pro', 'enterprise') THEN
            feature_available := TRUE;
        WHEN feature_name = 'advanced_analytics' AND org_tier = 'enterprise' THEN
            feature_available := TRUE;
        WHEN feature_name = 'basic_crm' THEN
            feature_available := TRUE;
    END CASE;

    RETURN feature_available;
END;
$$ LANGUAGE plpgsql;

\echo '✅ CRM Feature gating functions created'

-- Funções rastreamento uso CRM
CREATE OR REPLACE FUNCTION increment_leads_usage(
    org_uuid UUID DEFAULT current_setting('app.current_org_id', true)::UUID
)
RETURNS VOID AS $$
BEGIN
    IF org_uuid IS NULL THEN
        RETURN;
    END IF;

    UPDATE subscriptions
    SET usage_tracking = jsonb_set(
        usage_tracking,
        '{leads_count}',
        to_jsonb(COALESCE((usage_tracking->>'leads_count')::INT, 0) + 1)
    )
    WHERE organization_id = org_uuid;
END;
$$ LANGUAGE plpgsql;

\echo '✅ Usage tracking functions created'

-- Verificar limites uso CRM
CREATE OR REPLACE FUNCTION check_crm_usage_limit(
    limit_type VARCHAR,
    org_uuid UUID DEFAULT current_setting('app.current_org_id', true)::UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    current_usage INT;
    max_limit INT;
BEGIN
    IF org_uuid IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT
        COALESCE((usage_tracking->>limit_type)::INT, 0),
        COALESCE((limits->>limit_type)::INT, -1)
    INTO current_usage, max_limit
    FROM subscriptions
    WHERE organization_id = org_uuid;

    -- Se max_limit é -1, significa unlimited
    IF max_limit = -1 THEN
        RETURN TRUE;
    END IF;

    RETURN current_usage < max_limit;
END;
$$ LANGUAGE plpgsql;

\echo '✅ Usage limit checking functions created'

-- ============================================================================
-- UPDATE SUBSCRIPTION LIMITS FOR CRM
-- ============================================================================

-- Atualizar subscription limits para incluir funcionalidades CRM
UPDATE subscriptions SET 
    limits = jsonb_set(
        COALESCE(limits, '{}'),
        '{leads_max}',
        CASE 
            WHEN tier = 'free' THEN '100'::jsonb
            WHEN tier = 'pro' THEN '-1'::jsonb  -- unlimited
            WHEN tier = 'enterprise' THEN '-1'::jsonb
            ELSE '100'::jsonb
        END
    );

UPDATE subscriptions SET
    limits = jsonb_set(
        limits,
        '{ai_summaries_monthly}',
        CASE 
            WHEN tier = 'free' THEN '10'::jsonb
            WHEN tier = 'pro' THEN '100'::jsonb
            WHEN tier = 'enterprise' THEN '-1'::jsonb
            ELSE '10'::jsonb
        END
    );

UPDATE subscriptions SET
    limits = jsonb_set(
        limits,
        '{whatsapp_integration}',
        CASE 
            WHEN tier = 'free' THEN 'false'::jsonb
            ELSE 'true'::jsonb
        END
    );

UPDATE subscriptions SET
    limits = jsonb_set(
        limits,
        '{voip_integration}',
        CASE 
            WHEN tier = 'enterprise' THEN 'true'::jsonb
            ELSE 'false'::jsonb
        END
    );

\echo '✅ Subscription limits updated for CRM features'

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Inserir configurações padrão para organizações existentes
INSERT INTO organization_integrations (organization_id, provider, encrypted_credentials, status)
SELECT id, 'placeholder', '{"configured": false}', 'inactive'
FROM organizations
WHERE NOT EXISTS (
    SELECT 1 FROM organization_integrations 
    WHERE organization_integrations.organization_id = organizations.id
)
ON CONFLICT (organization_id, provider) DO NOTHING;

\echo '✅ Initial CRM data inserted'

-- ============================================================================
-- SCHEMA VERSION TRACKING
-- ============================================================================

-- Inserir versão desta migração
INSERT INTO schema_versions (version, description) 
VALUES (002, 'CRM tables schema: leads, communications, ai_summaries, integrations, audit_logs, file_attachments with organizational isolation')
ON CONFLICT (version) DO UPDATE SET 
    applied_at = NOW(),
    description = EXCLUDED.description;

\echo '🎉 CRM schema migration completed successfully!'
\echo '📊 Tables created: leads, communications, ai_summaries, organization_integrations, file_attachments, audit_logs'
\echo '🔒 All tables have organization_id isolation with performance indexes'
\echo '🎯 Feature gating functions ready for B2B CRM functionality'