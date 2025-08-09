-- =============================================
-- 010_performance_indexes.sql
-- Performance Indexes for Multi-Tenant Queries
-- Sistema: Next.js 14 + FastAPI + PostgreSQL  
-- Focus: Composite indexes (organization_id, other_fields)
-- =============================================

\echo '⚡ Creating performance indexes for multi-tenant queries...'

-- =============================================
-- COMMUNICATION PERFORMANCE INDEXES
-- =============================================

-- Message templates - common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_org_category_active 
ON message_templates(organization_id, category, is_active) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_templates_org_usage_count 
ON message_templates(organization_id, usage_count DESC, created_at DESC);

-- Template usage stats - analytics queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_template_usage_org_template_success 
ON template_usage_stats(organization_id, template_id, success_value, used_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_template_usage_org_date_success 
ON template_usage_stats(organization_id, used_at DESC, success_value) 
WHERE success_value = true;

-- VoIP configs - provider switching queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_voip_configs_org_provider_active 
ON voip_configs(organization_id, provider, is_active) 
WHERE setup_completed = true;

\echo '✅ Communication indexes created'

-- =============================================
-- AI/ML PERFORMANCE INDEXES
-- =============================================

-- AI conversations - session and lead queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_conv_org_lead_score 
ON ai_conversations(organization_id, lead_id, qualification_score DESC, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_conv_org_handoff_score 
ON ai_conversations(organization_id, handoff_triggered, qualification_score DESC) 
WHERE handoff_triggered = true;

-- AI training data - model improvement queries  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_training_org_type_feedback 
ON ai_training_data(organization_id, data_type, feedback_score DESC, created_at DESC);

-- Lead scoring models - active model queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scoring_models_org_active_accuracy 
ON lead_scoring_models(organization_id, is_active, accuracy_score DESC) 
WHERE is_active = true;

\echo '✅ AI/ML indexes created'

-- =============================================
-- ANALYTICS & INTEGRATION INDEXES
-- =============================================

-- Analytics events - dashboard queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_org_type_date_user 
ON analytics_events(organization_id, event_type, created_at DESC, user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_org_lead_date 
ON analytics_events(organization_id, lead_id, created_at DESC) 
WHERE lead_id IS NOT NULL;

-- Calendar integrations - sync status queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calendar_int_org_user_active 
ON calendar_integrations(organization_id, user_id, is_active, sync_enabled) 
WHERE is_active = true;

-- Calendar events - time-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calendar_events_org_time_lead 
ON calendar_events(organization_id, start_time, end_time, lead_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calendar_events_org_status_time 
ON calendar_events(organization_id, event_status, start_time) 
WHERE event_status = 'confirmed';

-- Marketing integrations - import status queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketing_int_org_platform_active 
ON marketing_integrations(organization_id, platform, is_active, import_enabled) 
WHERE is_active = true;

\echo '✅ Analytics & integration indexes created'

-- =============================================
-- SYSTEM SUPPORT INDEXES
-- =============================================

-- Webhook subscriptions - delivery queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhooks_org_provider_active 
ON webhook_subscriptions(organization_id, provider, is_active) 
WHERE is_active = true;

-- Webhook delivery logs - monitoring queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_logs_org_success_date 
ON webhook_delivery_logs(organization_id, success, created_at DESC);

-- API keys - service lookup queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_org_service_active 
ON api_keys(organization_id, service_name, is_active, key_name) 
WHERE is_active = true;

-- Background jobs - job processing queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bg_jobs_org_type_status 
ON background_jobs(organization_id, job_type, status, priority, scheduled_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bg_jobs_processing 
ON background_jobs(status, priority, scheduled_at) 
WHERE status IN ('pending', 'retrying');

\echo '✅ System support indexes created'

-- =============================================
-- ENHANCED EXISTING TABLE INDEXES
-- =============================================

-- Leads - enhanced multi-tenant queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_org_stage_updated_score 
ON leads(organization_id, stage, updated_at DESC, lead_score DESC NULLS LAST);

-- Communications - timeline performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_communications_org_lead_channel_date 
ON communications(organization_id, lead_id, channel, created_at DESC);

\echo '✅ Enhanced existing table indexes created'

-- Update schema version
INSERT INTO schema_versions (version, description) 
VALUES (10, 'Performance indexes: Multi-tenant composite indexes for all new tables + enhanced existing')
ON CONFLICT (version) DO NOTHING;

\echo '⚡ Performance indexes completed - Multi-tenant queries optimized!'