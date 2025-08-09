-- =============================================
-- 008_analytics_integrations.sql
-- Analytics & Integration Tables  
-- Sistema: Next.js 14 + FastAPI + PostgreSQL
-- Integrations: Google Calendar, Facebook/Google Ads
-- =============================================

\echo '📊 Creating analytics & integration tables...'

-- Event tracking para dashboards avançados
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    page_url TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_event_type CHECK (LENGTH(event_type) >= 3)
);

-- Indexes para analytics performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_org_type ON analytics_events(organization_id, event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_org_created ON analytics_events(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(organization_id, user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_lead ON analytics_events(organization_id, lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id, created_at DESC);

\echo '✅ Analytics events table created'

-- Google Calendar OAuth integration
CREATE TABLE IF NOT EXISTS calendar_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(20) DEFAULT 'google',
    access_token TEXT, -- encrypted
    refresh_token TEXT, -- encrypted  
    token_expires_at TIMESTAMPTZ,
    calendar_id VARCHAR(255),
    calendar_name VARCHAR(255),
    time_zone VARCHAR(100) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT TRUE,
    sync_enabled BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ,
    last_sync_status VARCHAR(20) DEFAULT 'pending', -- success, error, pending
    sync_error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_provider CHECK (provider IN ('google', 'outlook', 'apple', 'custom')),
    CONSTRAINT valid_sync_status CHECK (last_sync_status IN ('success', 'error', 'pending', 'disabled')),
    CONSTRAINT unique_user_provider UNIQUE (user_id, provider, calendar_id)
);

-- Indexes para calendar integrations
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_org_user ON calendar_integrations(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_provider ON calendar_integrations(provider, is_active);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_sync ON calendar_integrations(organization_id, last_sync_at DESC);

\echo '✅ Calendar integrations table created'

-- Calendar events cache/sync
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    calendar_integration_id UUID NOT NULL REFERENCES calendar_integrations(id) ON DELETE CASCADE,
    external_event_id VARCHAR(255) NOT NULL, -- Google/Outlook event ID
    title VARCHAR(500),
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_all_day BOOLEAN DEFAULT FALSE,
    location TEXT,
    attendees JSONB DEFAULT '[]',
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    event_status VARCHAR(20) DEFAULT 'confirmed', -- confirmed, tentative, cancelled
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_event_status CHECK (event_status IN ('confirmed', 'tentative', 'cancelled', 'pending')),
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT unique_external_event UNIQUE (calendar_integration_id, external_event_id)
);

-- Indexes para calendar events
CREATE INDEX IF NOT EXISTS idx_calendar_events_org_time ON calendar_events(organization_id, start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_integration ON calendar_events(calendar_integration_id, start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_lead ON calendar_events(lead_id, start_time);

\echo '✅ Calendar events table created'

-- Facebook/Google Ads lead import + ROI tracking
CREATE TABLE IF NOT EXISTS marketing_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL, -- facebook, google, linkedin, tiktok
    account_id VARCHAR(100),
    account_name VARCHAR(255),
    access_token TEXT, -- encrypted
    refresh_token TEXT, -- encrypted
    token_expires_at TIMESTAMPTZ,
    webhook_secret VARCHAR(255), -- for real-time updates
    is_active BOOLEAN DEFAULT TRUE,
    import_enabled BOOLEAN DEFAULT TRUE,
    last_import_at TIMESTAMPTZ,
    last_import_status VARCHAR(20) DEFAULT 'pending',
    total_leads_imported INTEGER DEFAULT 0,
    total_spend_imported DECIMAL(12,2) DEFAULT 0.00, -- for ROI calculation
    currency_code VARCHAR(3) DEFAULT 'BRL',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_platform CHECK (platform IN ('facebook', 'google', 'linkedin', 'tiktok', 'instagram', 'youtube', 'custom')),
    CONSTRAINT valid_import_status CHECK (last_import_status IN ('success', 'error', 'pending', 'disabled')),
    CONSTRAINT unique_org_platform_account UNIQUE (organization_id, platform, account_id)
);

-- Indexes para marketing integrations
CREATE INDEX IF NOT EXISTS idx_marketing_integrations_org_platform ON marketing_integrations(organization_id, platform);
CREATE INDEX IF NOT EXISTS idx_marketing_integrations_active ON marketing_integrations(is_active, import_enabled);
CREATE INDEX IF NOT EXISTS idx_marketing_integrations_import ON marketing_integrations(organization_id, last_import_at DESC);

\echo '✅ Marketing integrations table created'

-- Update schema version
INSERT INTO schema_versions (version, description) 
VALUES (8, 'Analytics & integration tables: analytics_events, calendar_integrations, calendar_events, marketing_integrations')
ON CONFLICT (version) DO NOTHING;

\echo '📊 Analytics & integration tables completed!'