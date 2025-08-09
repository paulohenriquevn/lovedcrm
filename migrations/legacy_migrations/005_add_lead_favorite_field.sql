-- MIGRATION 005: Add is_favorite field to leads table
-- Generated for: Add favorite functionality to leads for user-specific favorites

-- ============================================================================
-- MIGRATION CHANGES
-- ============================================================================

-- Add is_favorite column to leads table
ALTER TABLE leads 
ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE NOT NULL;

-- Add index for performance on favorite queries  
CREATE INDEX IF NOT EXISTS idx_leads_is_favorite 
ON leads(organization_id, is_favorite) 
WHERE is_favorite = TRUE;

-- ============================================================================
-- 🚨 CRITICAL: VERSION TRACKING (ALWAYS REQUIRED!)
-- ============================================================================

-- Record migration version (CRITICAL - always include this!)
INSERT INTO schema_versions (version, description) 
VALUES (005, 'Add is_favorite field to leads table for favorite functionality')
ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- CHECKLIST BEFORE APPLYING:
-- ============================================================================
-- [x] Migration number is sequential (001, 002, 003, 004, 005)
-- [x] SQL statements are idempotent (use IF NOT EXISTS, DEFAULT values)
-- [x] Version tracking INSERT is included
-- [x] Description accurately reflects changes
-- [x] Tested locally before committing
-- ============================================================================