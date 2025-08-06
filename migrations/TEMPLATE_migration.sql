-- TEMPLATE: Migration XXX - Description
-- Generated for: [Describe the purpose of this migration]

-- ============================================================================
-- MIGRATION CHANGES
-- ============================================================================

-- Add your SQL changes here
-- Examples:
-- ALTER TABLE users ADD COLUMN new_field VARCHAR(255);
-- CREATE TABLE new_table (...);
-- CREATE INDEX idx_name ON table_name(column);

-- ============================================================================
-- 🚨 CRITICAL: VERSION TRACKING (ALWAYS REQUIRED!)
-- ============================================================================

-- Record migration version (CRITICAL - always include this!)
INSERT INTO schema_versions (version, description) 
VALUES (XXX, 'Brief description of changes')
ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- CHECKLIST BEFORE APPLYING:
-- ============================================================================
-- [ ] Migration number is sequential (001, 002, 003...)
-- [ ] SQL statements are idempotent (use IF NOT EXISTS)
-- [ ] Version tracking INSERT is included
-- [ ] Description accurately reflects changes
-- [ ] Tested locally before committing
-- ============================================================================