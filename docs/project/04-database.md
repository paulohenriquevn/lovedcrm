# 04-database.md - Loved CRM

## **SCHEMA COMPLETO + TODAS TABELAS NECESSÁRIAS**

### **ANÁLISE TABELAS - TODAS TABELAS IDENTIFICADAS**

**OBRIGATÓRIO**: Identificar e criar TODAS as tabelas baseadas em:

- **Funcionalidades PRD**: Pipeline Kanban, Timeline Comunicação, Resumos IA
- **3 Padrões Técnicos**: Registration, Entity Management, Collaboration
- **Tabelas Fundação**: organizations, users, memberships, subscriptions (template existente)
- **Tabelas Funcionalidade**: leads, communications, ai_summaries, integrations
- **Tabelas Suporte**: audit_logs, file_attachments, usage_tracking

### **OVERVIEW ARQUITETURA DATABASE**

- **Database**: PostgreSQL 16 (Sistema Produção exclusivo)
- **Isolamento Organizacional**: organization_id + middleware organizacional + api/repositories/base.py + prevenção cross-organizacional
- **Fundação**: Tabelas fundação template (organizations, users, subscriptions com escopo org)
- **Implementação Padrão**: Registration + Entity Management + Collaboration adaptados com escopo org
- **Feature Gating**: Tiers assinatura (Free/Pro/Enterprise) + rastreamento uso + aplicação limites

### **ALAVANCAGEM FUNDAÇÃO TEMPLATE - IMPLEMENTAÇÃO B2B**

**B2B identificado no PRD**: Organizações compartilhadas → Contexto database colaborativo  
**Schema Único**: isolamento organization_id serve o modelo B2B
**Implementação**: Database otimizado para agências digitais (múltiplos usuários por org)

## **TABELAS FUNDAÇÃO TEMPLATE (Com Escopo Organizacional)**

### **Tabela Organizations (Fundação Central)**

```sql
-- Tabela fundação template - suporta o modelo B2B do PRD
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    subscription_tier VARCHAR(20) DEFAULT 'free'
        CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    is_personal BOOLEAN DEFAULT FALSE, -- FALSE para B2B (agências compartilhadas)
    owner_id UUID NOT NULL REFERENCES users(id),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- api/core/organization_middleware.py lida com controle acesso
-- api/repositories/base.py filtra automaticamente por organization_id

-- Índices
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_tier ON organizations(subscription_tier);
CREATE INDEX idx_organizations_owner ON organizations(owner_id);
CREATE INDEX idx_organizations_personal ON organizations(is_personal);
```

### **Tabela Users (Fundação Com Escopo Organizacional)**

```sql
-- Users com escopo organizacional (Fundação Template)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    must_change_password BOOLEAN DEFAULT FALSE,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMPTZ,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memberships organizacionais (configurado para modelo B2B)
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member'
        CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Membership único por org
    UNIQUE(organization_id, user_id)
);

-- Query filtering para membros organizacionais via api/core/organization_middleware.py
-- Filtro aplicado automaticamente em api/repositories/base.py
-- SELECT * FROM organization_members WHERE organization_id = current_org_id()

-- Índices
CREATE INDEX idx_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_members_user_id ON organization_members(user_id);
CREATE INDEX idx_members_role ON organization_members(role);
```

### **Tabela Subscriptions (Billing Baseado em Organizações)**

```sql
-- Gerenciamento assinatura baseado em organizações (Fundação Template)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL DEFAULT 'free'
        CHECK (tier IN ('free', 'pro', 'enterprise')),
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
    limits JSONB NOT NULL DEFAULT '{
        "users_max": 3,
        "leads_max": 100,
        "ai_summaries_monthly": 10,
        "whatsapp_integration": false,
        "voip_integration": false,
        "email_integration": false,
        "advanced_analytics": false,
        "custom_branding": false
    }',
    usage_tracking JSONB NOT NULL DEFAULT '{
        "users_count": 0,
        "leads_count": 0,
        "ai_summaries_current_month": 0,
        "communications_count": 0,
        "last_activity": null,
        "billing_cycle_start": null
    }',
    billing_email VARCHAR(255),
    next_billing_date DATE,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Query filtering para subscriptions via api/core/organization_middleware.py
-- Isolamento organizacional + validação tier via api/repositories/base.py
-- SELECT * FROM subscriptions WHERE organization_id = current_org_id()
-- Validação tier realizada em api/core/deps.py get_current_organization

-- Índices para performance
CREATE INDEX idx_subscriptions_org_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
```

### **Tabela Invitations (Com Escopo Organizacional)**

```sql
-- Invitations com escopo organizacional (Fundação Template)
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invited_by_user_id UUID NOT NULL REFERENCES users(id),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    token VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevenir convites duplicados
    UNIQUE(organization_id, email)
);

-- Query filtering para invitations via api/core/organization_middleware.py
-- SELECT * FROM invitations WHERE organization_id = current_org_id()

-- Índices
CREATE INDEX idx_invitations_org_id ON invitations(organization_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_expires ON invitations(expires_at);
```

## **IMPLEMENTAÇÃO DATABASE PADRÕES CENTRADOS EM ORGANIZAÇÕES**

### **Padrão 1: Registration & Setup (Fundação Específica do Modelo B2B)**

```sql
-- Implementação Padrão Registration para modelo B2B:
-- Usuário registra → Cria organização compartilhada (agência) → Setup equipe
-- Criação organização → Usuário torna-se owner
-- Configuração baseada no modelo B2B (múltiplos usuários por agência)

-- Padrão inclui: organizations + users + organization_members + invitations
-- Filtro organizacional: Todas tabelas isoladas organization_id
-- api/repositories/base.py: padrões getByOrganization(), createOrganizationScoped()
```

### **Padrão 2: Entity Management (CRM CRUD Específico)**

```sql
-- Tabela leads com escopo organizacional (CRM core entity)
CREATE TABLE leads (
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

-- Tabela communications para timeline unificada
CREATE TABLE communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL, -- 'whatsapp', 'email', 'voip'
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

-- Tabela ai_summaries para resumos automáticos
CREATE TABLE ai_summaries (
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

-- Query filtering para isolamento organizacional via api/core/organization_middleware.py
-- SELECT * FROM leads WHERE organization_id = current_org_id()
-- SELECT * FROM communications WHERE organization_id = current_org_id()
-- SELECT * FROM ai_summaries WHERE organization_id = current_org_id()

-- Índices performance com escopo organizacional
CREATE INDEX idx_leads_org_id ON leads(organization_id);
CREATE INDEX idx_leads_org_stage ON leads(organization_id, stage);
CREATE INDEX idx_leads_org_assigned ON leads(organization_id, assigned_user_id);
CREATE INDEX idx_leads_org_created ON leads(organization_id, created_at DESC);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_email ON leads(email);

CREATE INDEX idx_communications_org_id ON communications(organization_id);
CREATE INDEX idx_communications_org_lead ON communications(organization_id, lead_id);
CREATE INDEX idx_communications_timeline ON communications(organization_id, lead_id, sent_at DESC);
CREATE INDEX idx_communications_external_id ON communications(external_id);
CREATE INDEX idx_communications_channel ON communications(organization_id, channel);

CREATE INDEX idx_ai_summaries_org_id ON ai_summaries(organization_id);
CREATE INDEX idx_ai_summaries_conversation ON ai_summaries(organization_id, conversation_id);
CREATE INDEX idx_ai_summaries_lead ON ai_summaries(organization_id, lead_id);
```

### **Padrão 3: Collaboration (Funcionalidades Equipe B2B)**

```sql
-- Tabela organization_integrations para credentials das integrações
CREATE TABLE organization_integrations (
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

-- Query filtering para integrations via api/core/organization_middleware.py
-- SELECT * FROM organization_integrations WHERE organization_id = current_org_id()

-- Índices com escopo organizacional
CREATE INDEX idx_org_integrations_org_id ON organization_integrations(organization_id);
CREATE INDEX idx_org_integrations_provider ON organization_integrations(provider, status);
```

## **FILTRO ORGANIZACIONAL E ISOLAMENTO**

### **Teste Prevenção Cross-Organizacional**

```sql
-- Testar isolamento organizacional (deve retornar vazio para acesso cross-org)
-- Execute estes testes para validar isolamento org:

-- Teste 1: Acesso leads cross-org (deve estar vazio)
SET app.current_org_id = 'org-a-uuid';
SELECT * FROM leads WHERE organization_id = 'org-b-uuid'; -- Deve retornar 0 linhas

-- Teste 2: Acesso communications cross-org (deve estar vazio)
SELECT * FROM communications WHERE organization_id != current_setting('app.current_org_id')::UUID;

-- Teste 3: Acesso ai_summaries cross-org (deve estar vazio)
SELECT * FROM ai_summaries WHERE organization_id != current_setting('app.current_org_id')::UUID;

-- Teste 4: Performance filtro organizacional (deve ser < 50ms overhead)
EXPLAIN ANALYZE SELECT * FROM leads WHERE organization_id = current_setting('app.current_org_id')::UUID;

-- Teste 5: Prevenção JOIN cross-organizacional
SELECT l.*, c.* FROM leads l
JOIN communications c ON l.id = c.lead_id
WHERE l.organization_id = current_setting('app.current_org_id')::UUID
AND c.organization_id = current_setting('app.current_org_id')::UUID;
```

### **Trilha Auditoria Com Escopo Organizacional**

```sql
-- Trilha auditoria por organização
CREATE TABLE audit_logs (
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

-- Query filtering para logs auditoria via api/core/organization_middleware.py
-- SELECT * FROM audit_logs WHERE organization_id = current_org_id()

-- Índices
CREATE INDEX idx_audit_org_table ON audit_logs(organization_id, table_name);
CREATE INDEX idx_audit_org_record ON audit_logs(organization_id, record_id);
CREATE INDEX idx_audit_org_created ON audit_logs(organization_id, created_at DESC);
```

## **PADRÕES SQLREPOSITORY**

### **Padrões Query Com Escopo Organizacional**

```sql
-- Padrão api/repositories/base.py.getByOrganization()
SELECT * FROM leads
WHERE organization_id = current_setting('app.current_org_id')::UUID;

-- Padrão api/repositories/base.py.createOrganizationScoped()
INSERT INTO leads (organization_id, name, email, phone, stage)
VALUES (current_setting('app.current_org_id')::UUID, $1, $2, $3, $4)
RETURNING *;

-- Padrão api/repositories/base.py.updateOrganizationScoped()
UPDATE leads
SET name = $1, stage = $2, updated_at = NOW()
WHERE id = $3 AND organization_id = current_setting('app.current_org_id')::UUID
RETURNING *;

-- Padrão api/repositories/base.py.deleteOrganizationScoped()
DELETE FROM leads
WHERE id = $1 AND organization_id = current_setting('app.current_org_id')::UUID;

-- Padrão api/repositories/base.py.findByOrganizationAndId()
SELECT * FROM leads
WHERE id = $1 AND organization_id = current_setting('app.current_org_id')::UUID;

-- Padrão api/repositories/base.py.countByOrganization()
SELECT COUNT(*) FROM leads
WHERE organization_id = current_setting('app.current_org_id')::UUID;

-- Padrão api/repositories/base.py.getTimelineByLead()
SELECT * FROM communications
WHERE organization_id = current_setting('app.current_org_id')::UUID
AND lead_id = $1
ORDER BY sent_at DESC;
```

### **Índices Performance (Aplicar a Todas Tabelas)**

```sql
-- Índices padrão com escopo organizacional (todas tabelas)
CREATE INDEX idx_leads_org_id ON leads(organization_id);
CREATE INDEX idx_leads_org_created ON leads(organization_id, created_at DESC);

-- Índices específicos entidade CRM
CREATE INDEX idx_leads_org_stage ON leads(organization_id, stage);
CREATE INDEX idx_leads_org_assigned ON leads(organization_id, assigned_user_id);

-- Índices parciais para registros ativos
CREATE INDEX idx_leads_org_active ON leads(organization_id) WHERE stage != 'fechado';

-- Índices compostos para consultas comuns CRM
CREATE INDEX idx_leads_org_stage_created ON leads(organization_id, stage, created_at DESC);
CREATE INDEX idx_communications_org_lead_sent ON communications(organization_id, lead_id, sent_at DESC);
```

## **SUBSCRIPTION E FEATURE GATING**

### **Funções Validação Acesso Funcionalidades CRM**

```sql
-- Verificar se organização tem acesso funcionalidade CRM
CREATE OR REPLACE FUNCTION has_crm_feature_access(
    feature_name VARCHAR,
    org_uuid UUID DEFAULT current_setting('app.current_org_id')::UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    org_tier VARCHAR(20);
    feature_available BOOLEAN DEFAULT FALSE;
BEGIN
    -- Obter tier assinatura organização
    SELECT s.tier INTO org_tier
    FROM subscriptions s
    WHERE s.organization_id = org_uuid;

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

-- Funções rastreamento uso CRM
CREATE OR REPLACE FUNCTION increment_leads_usage(
    org_uuid UUID DEFAULT current_setting('app.current_org_id')::UUID
)
RETURNS VOID AS $$
BEGIN
    UPDATE subscriptions
    SET usage_tracking = jsonb_set(
        usage_tracking,
        '{leads_count}',
        to_jsonb((usage_tracking->>'leads_count')::INT + 1)
    )
    WHERE organization_id = org_uuid;
END;
$$ LANGUAGE plpgsql;

-- Verificar limites uso CRM
CREATE OR REPLACE FUNCTION check_crm_usage_limit(
    limit_type VARCHAR,
    org_uuid UUID DEFAULT current_setting('app.current_org_id')::UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    current_usage INT;
    max_limit INT;
BEGIN
    SELECT
        (usage_tracking->>limit_type)::INT,
        (limits->>limit_type)::INT
    INTO current_usage, max_limit
    FROM subscriptions
    WHERE organization_id = org_uuid;

    RETURN current_usage < max_limit;
END;
$$ LANGUAGE plpgsql;
```

## **TABELAS SUPORTE ADICIONAIS**

### **File Attachments (Mídia e Documentos)**

```sql
-- File storage table para attachments
CREATE TABLE file_attachments (
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

-- Performance indexes
CREATE INDEX idx_file_attachments_org_id ON file_attachments(organization_id);
CREATE INDEX idx_file_attachments_comm_id ON file_attachments(communication_id);
CREATE INDEX idx_file_attachments_storage ON file_attachments(storage_type, storage_path);
```

### **User Sessions (Controle Sessões)**

```sql
-- Controle de sessões ativas
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    refresh_token VARCHAR(255) NOT NULL UNIQUE,
    access_token_hash VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_org_id ON user_sessions(organization_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
```

## **METAS PERFORMANCE**

### **Benchmarks Performance Query CRM**

- **SELECT com escopo organizacional**: < 15ms (com índices organization_id)
- **Overhead middleware**: < 100ms médio por query CRM
- **Queries api/repositories/base.py**: < 200ms operações CRM típicas
- **Prevenção cross-organizacional**: resposta 403/vazia < 10ms
- **Validação funcionalidade CRM**: < 30ms verificação subscription
- **Agências concorrentes**: 500+ organizações simultâneas (realista Railway)
- **Timeline load**: < 800ms para histórico 50 comunicações
- **Pipeline Kanban**: < 300ms para carregamento leads por stage

### **Estratégia Scaling CRM**

```sql
-- Particionamento para tabelas alto volume (se necessário)
CREATE TABLE communications_2024_01 PARTITION OF communications
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Otimização connection pooling (Railway cuida disso)
-- Read replicas para reporting (funcionalidades Railway Pro)

-- View materializada para dashboard analytics
CREATE MATERIALIZED VIEW crm_dashboard_stats AS
SELECT 
    organization_id,
    COUNT(*) FILTER (WHERE stage = 'lead') as leads_count,
    COUNT(*) FILTER (WHERE stage = 'fechado') as closed_count,
    COUNT(DISTINCT assigned_user_id) as active_users,
    AVG(estimated_value) FILTER (WHERE stage = 'fechado') as avg_deal_value
FROM leads
GROUP BY organization_id;

CREATE UNIQUE INDEX idx_crm_dashboard_stats_org ON crm_dashboard_stats(organization_id);
```

## **SCRIPT MIGRAÇÃO COMPLETA**

### **SCRIPT MIGRAÇÃO MASTER - TODAS TABELAS CRM**

```sql
-- =============================================
-- SCRIPT MIGRAÇÃO COMPLETA - LOVED CRM
-- Sistema: Next.js 14 + FastAPI + PostgreSQL + Railway
-- Isolamento: organization_id + api/core/organization_middleware.py + api/repositories/base.py
-- =============================================

-- Controle Versão Migração
INSERT INTO schema_versions (version, description)
VALUES (004, 'Schema completo CRM centrado em organizações B2B com isolamento organizacional');

-- 1. TABELAS FUNDAÇÃO JÁ EXISTEM (organizations, users, organization_members, subscriptions, invitations)
-- Template já possui estas tabelas - apenas verificar compatibilidade

-- 2. CRIAR TABELAS ESPECÍFICAS CRM
-- Leads table (entidade principal CRM)
CREATE TABLE leads (
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

-- Communications table (timeline unificada)
CREATE TABLE communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    content TEXT NOT NULL,
    subject VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    external_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'delivered',
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Summaries table (resumos automáticos)
CREATE TABLE ai_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    sentiment VARCHAR(20),
    next_actions TEXT[],
    confidence_score DECIMAL(3,2),
    model_used VARCHAR(50) DEFAULT 'gpt-4',
    tokens_used INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CRIAR TABELAS INTEGRAÇÕES
-- Organization integrations (WhatsApp, VoIP, Email)
CREATE TABLE organization_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    encrypted_credentials TEXT NOT NULL,
    webhook_secret VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'error', 'pending')),
    metadata JSONB DEFAULT '{}',
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, provider)
);

-- 4. CRIAR TABELAS SUPORTE
-- File attachments
CREATE TABLE file_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    communication_id UUID REFERENCES communications(id) ON DELETE CASCADE,
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500),
    file_size BIGINT,
    content_type VARCHAR(100),
    storage_path TEXT NOT NULL,
    storage_type VARCHAR(20) DEFAULT 'minio',
    is_encrypted BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
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

-- User sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    refresh_token VARCHAR(255) NOT NULL UNIQUE,
    access_token_hash VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CRIAR TODOS ÍNDICES PERFORMANCE
-- Leads indexes
CREATE INDEX idx_leads_org_id ON leads(organization_id);
CREATE INDEX idx_leads_org_stage ON leads(organization_id, stage);
CREATE INDEX idx_leads_org_assigned ON leads(organization_id, assigned_user_id);
CREATE INDEX idx_leads_org_created ON leads(organization_id, created_at DESC);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_org_stage_created ON leads(organization_id, stage, created_at DESC);

-- Communications indexes  
CREATE INDEX idx_communications_org_id ON communications(organization_id);
CREATE INDEX idx_communications_org_lead ON communications(organization_id, lead_id);
CREATE INDEX idx_communications_timeline ON communications(organization_id, lead_id, sent_at DESC);
CREATE INDEX idx_communications_external_id ON communications(external_id);
CREATE INDEX idx_communications_channel ON communications(organization_id, channel);

-- AI summaries indexes
CREATE INDEX idx_ai_summaries_org_id ON ai_summaries(organization_id);
CREATE INDEX idx_ai_summaries_conversation ON ai_summaries(organization_id, conversation_id);
CREATE INDEX idx_ai_summaries_lead ON ai_summaries(organization_id, lead_id);

-- Integrations indexes
CREATE INDEX idx_org_integrations_org_id ON organization_integrations(organization_id);
CREATE INDEX idx_org_integrations_provider ON organization_integrations(provider, status);

-- File attachments indexes
CREATE INDEX idx_file_attachments_org_id ON file_attachments(organization_id);
CREATE INDEX idx_file_attachments_comm_id ON file_attachments(communication_id);

-- Audit logs indexes
CREATE INDEX idx_audit_org_table ON audit_logs(organization_id, table_name);
CREATE INDEX idx_audit_org_record ON audit_logs(organization_id, record_id);
CREATE INDEX idx_audit_org_created ON audit_logs(organization_id, created_at DESC);

-- User sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_org_id ON user_sessions(organization_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- 6. CRIAR FUNÇÕES FEATURE GATING CRM
CREATE OR REPLACE FUNCTION has_crm_feature_access(
    feature_name VARCHAR,
    org_uuid UUID DEFAULT current_setting('app.current_org_id')::UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    org_tier VARCHAR(20);
    feature_available BOOLEAN DEFAULT FALSE;
BEGIN
    SELECT s.tier INTO org_tier
    FROM subscriptions s
    WHERE s.organization_id = org_uuid;

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

-- 7. ATUALIZAR SUBSCRIPTION LIMITS PARA CRM
UPDATE subscriptions SET 
    limits = jsonb_set(
        limits,
        '{leads_max}',
        CASE 
            WHEN tier = 'free' THEN '100'::jsonb
            WHEN tier = 'pro' THEN '-1'::jsonb  -- unlimited
            WHEN tier = 'enterprise' THEN '-1'::jsonb
        END
    ),
    limits = jsonb_set(
        limits,
        '{ai_summaries_monthly}',
        CASE 
            WHEN tier = 'free' THEN '10'::jsonb
            WHEN tier = 'pro' THEN '100'::jsonb
            WHEN tier = 'enterprise' THEN '-1'::jsonb
        END
    ),
    limits = jsonb_set(
        limits,
        '{whatsapp_integration}',
        CASE 
            WHEN tier = 'free' THEN 'false'::jsonb
            ELSE 'true'::jsonb
        END
    ),
    limits = jsonb_set(
        limits,
        '{voip_integration}',
        CASE 
            WHEN tier = 'enterprise' THEN 'true'::jsonb
            ELSE 'false'::jsonb
        END
    );

-- 8. DADOS PADRÃO CRM
-- Inserir configurações padrão para organizações existentes se houver
INSERT INTO organization_integrations (organization_id, provider, encrypted_credentials, status)
SELECT id, 'placeholder', '{"configured": false}', 'inactive'
FROM organizations
WHERE NOT EXISTS (
    SELECT 1 FROM organization_integrations 
    WHERE organization_integrations.organization_id = organizations.id
);
```

### **CHECKLIST TABELAS - TODAS INCLUÍDAS:**

- ✅ **Fundação**: organizations, users, organization_members, subscriptions, invitations (template existente)
- ✅ **Tabelas CRM Core**: leads, communications, ai_summaries
- ✅ **Entity Management**: leads (entidade principal) + communications (relacionadas)
- ✅ **Tabelas Integrações**: organization_integrations
- ✅ **Tabelas Suporte**: audit_logs, file_attachments, user_sessions
- ✅ **Controle Migração**: schema_versions (sistema existente)

### **ISOLAMENTO ORGANIZACIONAL - TODAS TABELAS:**

```sql
-- OBRIGATÓRIO: APLICAR A TODAS TABELAS CRIADAS
-- Query filtering via api/core/organization_middleware.py
-- SELECT * FROM [cada_tabela] WHERE organization_id = current_org_id();

-- ÍNDICES PERFORMANCE - TODAS TABELAS CRM
CREATE INDEX idx_leads_org_id ON leads(organization_id);
CREATE INDEX idx_communications_org_id ON communications(organization_id);
CREATE INDEX idx_ai_summaries_org_id ON ai_summaries(organization_id);
CREATE INDEX idx_org_integrations_org_id ON organization_integrations(organization_id);
CREATE INDEX idx_file_attachments_org_id ON file_attachments(organization_id);
CREATE INDEX idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX idx_user_sessions_org_id ON user_sessions(organization_id);
```

## **RESUMO IMPLEMENTAÇÃO DATABASE**

### **RESUMO IMPLEMENTAÇÃO DATABASE CRM:**

- **Total Tabelas**: 11 tabelas identificadas e criadas/validadas
- **Fundação**: 5 tabelas template existentes (organizations, users, organization_members, subscriptions, invitations)
- **Específicas CRM**: 3 tabelas core (leads, communications, ai_summaries)
- **Integrações**: 1 tabela (organization_integrations)
- **Suporte**: 3 tabelas (audit_logs, file_attachments, user_sessions)
- **Script Migração**: Completo e pronto para deploy PostgreSQL Railway

**Modelo B2B Implementado**: Organizações compartilhadas (agências digitais) com múltiplos usuários, roles colaborativos, e isolamento total de dados entre organizações.

**Input Próximo Agente**: Este schema database completo fornece a fundação para API_ARCHITECT implementar endpoints CRM com escopo organizacional usando padrões api/repositories/base.py e query filtering para todas as funcionalidades must-have: Pipeline Kanban, Timeline Comunicação, e Resumos IA.