-- Migration 004: Lead Score History Table
-- Story 3.1: Lead Management MVP - Score History Tracking
-- Creates lead_score_history table for tracking score changes over time

BEGIN;

-- Create lead_score_history table
CREATE TABLE lead_score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign keys with CASCADE for clean deletion
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Score data
    score DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (score >= 0 AND score <= 100),
    previous_score DECIMAL(5,2) NULL CHECK (previous_score IS NULL OR (previous_score >= 0 AND previous_score <= 100)),
    score_factors JSONB NOT NULL DEFAULT '{}',
    
    -- Change tracking
    change_reason VARCHAR(100) NULL,
    changed_by_user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes for efficient queries
CREATE INDEX idx_lead_score_history_lead_id ON lead_score_history(lead_id);
CREATE INDEX idx_lead_score_history_org_id ON lead_score_history(organization_id);
CREATE INDEX idx_lead_score_history_created_at ON lead_score_history(created_at);
CREATE INDEX idx_lead_score_history_lead_date ON lead_score_history(lead_id, created_at);

-- Composite index for multi-tenant queries (organization + lead + chronological)
CREATE INDEX idx_lead_score_history_org_lead_date ON lead_score_history(organization_id, lead_id, created_at);

-- Score performance index (find leads by score range over time)
CREATE INDEX idx_lead_score_history_org_score_date ON lead_score_history(organization_id, score, created_at);

-- Comments for documentation
COMMENT ON TABLE lead_score_history IS 'Tracks historical changes in lead scores for trend analysis and ML training data';
COMMENT ON COLUMN lead_score_history.score IS 'Current calculated lead score (0-100) at time of change';
COMMENT ON COLUMN lead_score_history.previous_score IS 'Previous score before this change (NULL for first entry)';
COMMENT ON COLUMN lead_score_history.score_factors IS 'JSON breakdown of scoring factors at time of calculation';
COMMENT ON COLUMN lead_score_history.change_reason IS 'Reason for score recalculation: lead_updated, stage_changed, manual_recalc, etc.';
COMMENT ON COLUMN lead_score_history.changed_by_user_id IS 'User who triggered the score change (NULL for system changes)';

-- Update schema version
INSERT INTO schema_versions (version, description, applied_at) 
VALUES (4, 'Add lead_score_history table for tracking score changes over time with multi-tenant isolation', NOW());

COMMIT;