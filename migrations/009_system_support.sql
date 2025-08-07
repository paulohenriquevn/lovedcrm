-- =============================================
-- 009_system_support.sql
-- System Support Tables
-- Sistema: Next.js 14 + FastAPI + PostgreSQL
-- Support: Webhooks, API Keys, Background jobs
-- =============================================

\echo '⚙️ Creating system support tables...'

-- Webhook subscriptions (Stripe, WhatsApp, Facebook, etc)
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    webhook_url TEXT NOT NULL,
    webhook_secret VARCHAR(255), -- for signature verification
    events JSONB DEFAULT '[]', -- array de events subscribed ['payment.success', 'lead.created']
    provider VARCHAR(50) NOT NULL, -- stripe, whatsapp, facebook, google, custom
    is_active BOOLEAN DEFAULT TRUE,
    retry_policy JSONB DEFAULT '{"max_retries": 3, "backoff": "exponential"}',
    last_ping_at TIMESTAMPTZ,
    last_ping_status VARCHAR(20) DEFAULT 'pending',
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_provider CHECK (provider IN ('stripe', 'whatsapp', 'facebook', 'google', 'linkedin', 'tiktok', 'custom')),
    CONSTRAINT valid_ping_status CHECK (last_ping_status IN ('success', 'error', 'pending', 'timeout')),
    CONSTRAINT valid_url CHECK (webhook_url ~* '^https?://'),
    CONSTRAINT unique_org_provider_url UNIQUE (organization_id, provider, webhook_url)
);

-- Indexes para webhooks
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_org_provider ON webhook_subscriptions(organization_id, provider);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_active ON webhook_subscriptions(is_active, provider);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_ping ON webhook_subscriptions(organization_id, last_ping_at DESC);

\echo '✅ Webhook subscriptions table created'

-- Webhook delivery logs (for debugging and monitoring)
CREATE TABLE IF NOT EXISTS webhook_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    webhook_subscription_id UUID NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB,
    http_status INTEGER,
    response_body TEXT,
    response_headers JSONB,
    delivery_attempt INTEGER DEFAULT 1,
    delivery_duration_ms INTEGER,
    success BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_http_status CHECK (http_status >= 100 AND http_status < 600),
    CONSTRAINT valid_delivery_attempt CHECK (delivery_attempt >= 1 AND delivery_attempt <= 10)
);

-- Indexes para webhook logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_org_created ON webhook_delivery_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_subscription ON webhook_delivery_logs(webhook_subscription_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_success ON webhook_delivery_logs(organization_id, success, created_at DESC);

\echo '✅ Webhook delivery logs table created'

-- API keys externas por organization (encrypted storage)
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    service_name VARCHAR(50) NOT NULL,
    key_name VARCHAR(100), -- 'primary', 'secondary', 'sandbox', etc
    key_value TEXT, -- encrypted with organization-specific key
    key_type VARCHAR(20) DEFAULT 'api_key', -- api_key, oauth_token, jwt, custom
    scopes JSONB DEFAULT '[]', -- permissions/scopes for this key
    is_active BOOLEAN DEFAULT TRUE,
    is_sandbox BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    rotation_policy JSONB DEFAULT '{"auto_rotate": false, "rotate_days": 90}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_service_name CHECK (LENGTH(service_name) >= 2),
    CONSTRAINT valid_key_type CHECK (key_type IN ('api_key', 'oauth_token', 'jwt', 'webhook_secret', 'custom')),
    CONSTRAINT unique_org_service_key UNIQUE (organization_id, service_name, key_name)
);

-- Indexes para API keys
CREATE INDEX IF NOT EXISTS idx_api_keys_org_service ON api_keys(organization_id, service_name);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires ON api_keys(expires_at) WHERE expires_at IS NOT NULL;

\echo '✅ API keys table created'

-- Background job queue (for async processing)
CREATE TABLE IF NOT EXISTS background_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    job_type VARCHAR(100) NOT NULL,
    job_data JSONB,
    priority INTEGER DEFAULT 5, -- 1 (highest) to 10 (lowest)
    status VARCHAR(20) DEFAULT 'pending',
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMPTZ,
    worker_id VARCHAR(100), -- which worker processed this job
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_job_type CHECK (LENGTH(job_type) >= 3),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'retrying')),
    CONSTRAINT valid_priority CHECK (priority >= 1 AND priority <= 10),
    CONSTRAINT valid_retry_count CHECK (retry_count >= 0 AND retry_count <= max_retries)
);

-- Indexes para background jobs
CREATE INDEX IF NOT EXISTS idx_background_jobs_status_priority ON background_jobs(status, priority, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_background_jobs_org_type ON background_jobs(organization_id, job_type);
CREATE INDEX IF NOT EXISTS idx_background_jobs_scheduled ON background_jobs(scheduled_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_background_jobs_retry ON background_jobs(next_retry_at) WHERE status = 'retrying';

\echo '✅ Background jobs table created'

-- Update schema version
INSERT INTO schema_versions (version, description) 
VALUES (9, 'System support tables: webhook_subscriptions, webhook_delivery_logs, api_keys, background_jobs')
ON CONFLICT (version) DO NOTHING;

\echo '⚙️ System support tables completed!'