-- =============================================
-- 002_analytics_enhancements.sql
-- STORY 3.2: LEAD ANALYTICS & ADVANCED INSIGHTS
-- =============================================
-- Sistema: Analytics layer baseado no Story 3.1 ML scoring foundation
-- Integration: Leverages existing leads table + audit_logs + scoring services
-- Performance: Materialized views + selective indexes for dashboard queries
-- Generated: 2025-08-12 - ANALYTICS ENHANCEMENT MIGRATION
-- =============================================

\echo '🚀 Creating Lead Analytics & Advanced Insights schema enhancements...'

-- ============================================================================
-- LEAD BEHAVIOR TRACKING (for engagement analytics)
-- ============================================================================

-- Lead behavior tracking for engagement analytics and behavioral segmentation
CREATE TABLE IF NOT EXISTS lead_behavior_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Behavior metrics (calculated from interactions)
    interaction_count INTEGER DEFAULT 0,
    last_interaction_at TIMESTAMP WITH TIME ZONE,
    engagement_score DECIMAL(5,2) DEFAULT 0.00,
    
    -- Stage timing analysis (seconds spent in each stage)
    time_in_lead_stage INTEGER DEFAULT 0,
    time_in_contact_stage INTEGER DEFAULT 0,
    time_in_proposal_stage INTEGER DEFAULT 0,
    time_in_negotiation_stage INTEGER DEFAULT 0,
    
    -- Analytics metadata for behavioral patterns
    behavioral_flags JSONB DEFAULT '{}',
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes for behavior tracking
CREATE INDEX IF NOT EXISTS idx_lead_behavior_org_id ON lead_behavior_tracking(organization_id);
CREATE INDEX IF NOT EXISTS idx_lead_behavior_lead_id ON lead_behavior_tracking(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_behavior_engagement ON lead_behavior_tracking(organization_id, engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_lead_behavior_last_interaction ON lead_behavior_tracking(organization_id, last_interaction_at DESC);

\echo '✅ Lead behavior tracking table with performance indexes'

-- ============================================================================
-- ANALYTICS EVENTS (for performance metrics aggregation)
-- ============================================================================

-- Aggregated analytics events for high-performance dashboard queries
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Event metadata for analytics aggregation
    event_type VARCHAR(50) NOT NULL,    -- 'conversion_rate', 'stage_transition', 'score_change', 'source_performance'
    event_date DATE NOT NULL,
    
    -- Aggregated metrics (pre-calculated for performance)
    metric_value DECIMAL(12,4) NOT NULL,
    metric_metadata JSONB DEFAULT '{}',
    
    -- Reference data for drill-down analysis
    entity_type VARCHAR(50),     -- 'lead', 'stage', 'source', 'user'
    entity_id VARCHAR(255),      -- specific ID or name for filtering
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics performance indexes (optimized for dashboard queries)
CREATE INDEX IF NOT EXISTS idx_analytics_org_date ON analytics_events(organization_id, event_date);
CREATE INDEX IF NOT EXISTS idx_analytics_type_date ON analytics_events(event_type, event_date);
CREATE INDEX IF NOT EXISTS idx_analytics_entity ON analytics_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_org_type_entity ON analytics_events(organization_id, event_type, entity_type);

-- Prevent duplicate analytics events (data integrity)
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_unique_event 
ON analytics_events(organization_id, event_type, event_date, entity_type, COALESCE(entity_id, ''));

\echo '✅ Analytics events table with aggregation indexes'

-- ============================================================================
-- MATERIALIZED VIEW FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Daily lead metrics materialized view for ultra-fast dashboard queries
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_lead_metrics AS
SELECT 
    organization_id,
    DATE(created_at) as metric_date,
    
    -- Basic lead metrics
    COUNT(*) as total_leads,
    COUNT(CASE WHEN stage = 'fechado' AND is_won = true THEN 1 END) as closed_won_leads,
    COUNT(CASE WHEN stage = 'fechado' AND is_won = false THEN 1 END) as closed_lost_leads,
    
    -- Lead scoring metrics (Story 3.1 integration)
    AVG(COALESCE(lead_score, 0)) as avg_lead_score,
    COUNT(CASE WHEN lead_score >= 80 THEN 1 END) as high_score_leads,
    COUNT(CASE WHEN lead_score >= 60 AND lead_score < 80 THEN 1 END) as medium_score_leads,
    COUNT(CASE WHEN lead_score < 60 THEN 1 END) as low_score_leads,
    
    -- Financial metrics
    SUM(COALESCE(estimated_value, 0)) as total_estimated_value,
    AVG(COALESCE(estimated_value, 0)) as avg_estimated_value,
    SUM(CASE WHEN stage = 'fechado' AND is_won = true THEN COALESCE(actual_value, estimated_value, 0) END) as total_won_value,
    
    -- Source distribution
    COUNT(CASE WHEN source = 'linkedin' THEN 1 END) as linkedin_leads,
    COUNT(CASE WHEN source = 'google_ads' THEN 1 END) as google_ads_leads,
    COUNT(CASE WHEN source = 'referral' THEN 1 END) as referral_leads,
    COUNT(CASE WHEN source = 'direct' THEN 1 END) as direct_leads,
    COUNT(CASE WHEN source NOT IN ('linkedin', 'google_ads', 'referral', 'direct') THEN 1 END) as other_source_leads
    
FROM leads 
WHERE created_at >= CURRENT_DATE - INTERVAL '365 days'  -- Last year for performance
GROUP BY organization_id, DATE(created_at);

-- Materialized view index for dashboard performance
CREATE INDEX IF NOT EXISTS idx_daily_metrics_org_date ON daily_lead_metrics(organization_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date_score ON daily_lead_metrics(metric_date, avg_lead_score);

\echo '✅ Daily lead metrics materialized view with performance indexes'

-- ============================================================================
-- ANALYTICS FUNCTIONS (for dashboard calculations)
-- ============================================================================

-- Function to refresh daily metrics materialized view
CREATE OR REPLACE FUNCTION refresh_daily_lead_metrics()
RETURNS VOID AS $$
BEGIN
    -- Refresh materialized view with concurrent access
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_lead_metrics;
    
    -- Log refresh for monitoring
    INSERT INTO analytics_events (
        organization_id, event_type, event_date, metric_value, entity_type
    ) 
    SELECT 
        '00000000-0000-0000-0000-000000000000'::UUID,  -- System organization
        'materialized_view_refresh',
        CURRENT_DATE,
        EXTRACT(EPOCH FROM NOW())::DECIMAL,  -- Timestamp as metric
        'system'
    WHERE NOT EXISTS (
        SELECT 1 FROM analytics_events 
        WHERE event_type = 'materialized_view_refresh' 
        AND event_date = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql;

\echo '✅ Analytics functions for materialized view management'

-- ============================================================================
-- PERFORMANCE ENHANCEMENTS FOR EXISTING TABLES
-- ============================================================================

-- Additional indexes on existing tables for analytics performance
-- These complement the existing indexes from Story 3.1

-- Leads table analytics indexes (if not already exist)
CREATE INDEX IF NOT EXISTS idx_leads_analytics_org_score_stage ON leads(organization_id, lead_score DESC, stage);
CREATE INDEX IF NOT EXISTS idx_leads_analytics_org_created_score ON leads(organization_id, created_at DESC, lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_analytics_org_source_stage ON leads(organization_id, source, stage);

-- Audit logs analytics indexes for stage timing analysis
CREATE INDEX IF NOT EXISTS idx_audit_logs_analytics_org_table_action ON audit_logs(organization_id, table_name, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_analytics_org_created ON audit_logs(organization_id, created_at DESC);

-- Communications table analytics indexes for engagement calculation
CREATE INDEX IF NOT EXISTS idx_communications_analytics_org_lead_created ON communications(organization_id, lead_id, created_at DESC);

\echo '✅ Performance enhancement indexes for existing tables'

-- ============================================================================
-- DATA INTEGRITY CONSTRAINTS
-- ============================================================================

-- Constraints for data integrity in analytics tables
ALTER TABLE lead_behavior_tracking 
    ADD CONSTRAINT chk_lead_behavior_engagement_score 
    CHECK (engagement_score >= 0 AND engagement_score <= 100);

ALTER TABLE lead_behavior_tracking 
    ADD CONSTRAINT chk_lead_behavior_interaction_count 
    CHECK (interaction_count >= 0);

ALTER TABLE analytics_events 
    ADD CONSTRAINT chk_analytics_events_date 
    CHECK (event_date >= '2023-01-01' AND event_date <= CURRENT_DATE + INTERVAL '1 day');

\echo '✅ Data integrity constraints applied'

-- ============================================================================
-- INITIAL ANALYTICS DATA POPULATION
-- ============================================================================

-- Populate initial behavior tracking data for existing leads
INSERT INTO lead_behavior_tracking (
    organization_id, lead_id, interaction_count, last_interaction_at, 
    engagement_score, calculated_at
)
SELECT 
    l.organization_id,
    l.id,
    COALESCE(comm_count.count, 0) as interaction_count,
    comm_count.last_communication as last_interaction_at,
    CASE 
        WHEN COALESCE(comm_count.count, 0) >= 5 THEN 75.0
        WHEN COALESCE(comm_count.count, 0) >= 3 THEN 50.0  
        WHEN COALESCE(comm_count.count, 0) >= 1 THEN 25.0
        ELSE 0.0
    END as engagement_score,
    NOW()
FROM leads l
LEFT JOIN (
    SELECT 
        lead_id,
        organization_id,
        COUNT(*) as count,
        MAX(created_at) as last_communication
    FROM communications 
    GROUP BY lead_id, organization_id
) comm_count ON l.id = comm_count.lead_id AND l.organization_id = comm_count.organization_id
WHERE NOT EXISTS (
    SELECT 1 FROM lead_behavior_tracking bt 
    WHERE bt.lead_id = l.id AND bt.organization_id = l.organization_id
);

\echo '✅ Initial behavior tracking data populated for existing leads'

-- ============================================================================
-- ANALYTICS TRIGGERS FOR REAL-TIME UPDATES
-- ============================================================================

-- Trigger function to update behavior tracking when communications change
CREATE OR REPLACE FUNCTION update_lead_behavior_on_communication()
RETURNS TRIGGER AS $$
BEGIN
    -- Update behavior tracking for the lead
    INSERT INTO lead_behavior_tracking (
        organization_id, lead_id, interaction_count, last_interaction_at, 
        engagement_score, calculated_at
    )
    SELECT 
        NEW.organization_id,
        NEW.lead_id,
        COUNT(*),
        MAX(created_at),
        CASE 
            WHEN COUNT(*) >= 5 THEN 75.0
            WHEN COUNT(*) >= 3 THEN 50.0
            WHEN COUNT(*) >= 1 THEN 25.0
            ELSE 0.0
        END,
        NOW()
    FROM communications 
    WHERE lead_id = NEW.lead_id AND organization_id = NEW.organization_id
    ON CONFLICT (lead_id) DO UPDATE SET
        interaction_count = EXCLUDED.interaction_count,
        last_interaction_at = EXCLUDED.last_interaction_at,
        engagement_score = EXCLUDED.engagement_score,
        calculated_at = NOW(),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to communications table
CREATE TRIGGER trigger_update_lead_behavior_on_communication
    AFTER INSERT OR UPDATE ON communications
    FOR EACH ROW
    EXECUTE FUNCTION update_lead_behavior_on_communication();

\echo '✅ Real-time behavior tracking triggers applied'

-- ============================================================================
-- VERSION TRACKING
-- ============================================================================

-- Track this migration
INSERT INTO schema_versions (version, description) 
VALUES (2, 'Story 3.2: Lead Analytics & Advanced Insights - Schema enhancements with behavior tracking, analytics events, materialized views, and performance indexes');

\echo '✅ Analytics schema enhancement migration completed successfully'
\echo '📊 Ready for Story 3.2 analytics dashboard implementation'