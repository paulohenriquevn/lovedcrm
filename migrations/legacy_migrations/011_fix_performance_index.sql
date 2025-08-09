-- =============================================
-- 011_fix_performance_index.sql
-- Fix Performance Index - Remove invalid lead_score reference
-- =============================================

\echo '🔧 Fixing performance index...'

-- Enhanced leads queries (without lead_score since it doesn't exist)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_org_stage_updated_value 
ON leads(organization_id, stage, updated_at DESC, estimated_value DESC NULLS LAST);

-- Update schema version
INSERT INTO schema_versions (version, description) 
VALUES (11, 'Fix performance index: Corrected leads index without lead_score reference')
ON CONFLICT (version) DO NOTHING;

\echo '✅ Performance index fixed!'