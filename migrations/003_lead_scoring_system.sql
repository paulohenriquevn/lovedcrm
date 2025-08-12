-- Migration 003: Lead Scoring System
-- Story 3.1: Lead Management MVP - Scoring, Duplicate Detection, Assignment
-- Adds lead_score, score_factors, and duplicate_check_hash fields to leads table

BEGIN;

-- Add lead scoring fields to leads table
ALTER TABLE leads 
ADD COLUMN lead_score DECIMAL(5,2) DEFAULT 0.00 CHECK (lead_score >= 0 AND lead_score <= 100),
ADD COLUMN score_factors JSONB DEFAULT '{}',
ADD COLUMN duplicate_check_hash VARCHAR(64) NULL;

-- Add indexes for performance
CREATE INDEX idx_leads_score ON leads(lead_score DESC);
CREATE INDEX idx_leads_duplicate_hash ON leads(duplicate_check_hash) WHERE duplicate_check_hash IS NOT NULL;
CREATE INDEX idx_leads_org_score ON leads(organization_id, lead_score DESC);

-- Add comments for documentation
COMMENT ON COLUMN leads.lead_score IS 'Calculated lead score (0-100) based on 6 scoring factors';
COMMENT ON COLUMN leads.score_factors IS 'JSON breakdown of scoring factors: contact_info, engagement, value, source, timing, qualification';
COMMENT ON COLUMN leads.duplicate_check_hash IS 'Hash for duplicate detection using fuzzy matching on name+email+phone';

-- Update schema version
INSERT INTO schema_versions (version, description, applied_at) 
VALUES (3, 'Add lead scoring system with score calculation, factors breakdown, and duplicate detection support', NOW());

COMMIT;