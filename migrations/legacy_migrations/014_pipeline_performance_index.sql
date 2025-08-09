-- =============================================
-- 014_pipeline_performance_index.sql
-- Performance Index for Pipeline Kanban Queries
-- Sistema: Pipeline Kanban MVP - Story 1.1
-- Focus: Optimize WHERE organization_id = ? AND stage = ? queries
-- =============================================

\echo '⚡ Creating Pipeline Kanban performance index...'

-- =============================================
-- PIPELINE KANBAN PERFORMANCE INDEX
-- =============================================

-- Critical index for Pipeline Kanban stage filtering
-- Query pattern: SELECT * FROM leads WHERE organization_id = ? AND stage = ?
-- This is the most common query when loading Pipeline Kanban data by stage
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_org_stage 
ON leads (organization_id, stage);

\echo '✅ Pipeline Kanban performance index created'

-- =============================================
-- ADDITIONAL PIPELINE OPTIMIZATIONS
-- =============================================

-- Index for lead ordering within stages (by updated_at DESC)
-- Query pattern: ORDER BY updated_at DESC within each stage
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_org_stage_updated 
ON leads (organization_id, stage, updated_at DESC);

-- Index for lead filtering by assignment (common in team-based CRM)
-- Query pattern: WHERE organization_id = ? AND assigned_user_id = ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_org_assigned_user 
ON leads (organization_id, assigned_user_id);

-- Index for lead search within organization (name, email, phone)
-- Query pattern: WHERE organization_id = ? AND (name ILIKE ? OR email ILIKE ? OR phone ILIKE ?)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_org_search 
ON leads (organization_id, name, email, phone);

\echo '✅ Additional Pipeline optimization indexes created'

-- Update schema version
INSERT INTO schema_versions (version, description) 
VALUES (14, 'Pipeline Kanban performance: Critical indexes for stage filtering and lead management')
ON CONFLICT (version) DO NOTHING;

\echo '⚡ Pipeline performance indexes completed - Kanban queries optimized!'