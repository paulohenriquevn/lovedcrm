-- =============================================
-- 003_fix_lead_metadata_column.sql
-- FIX: Renomear coluna 'metadata' para 'lead_metadata' na tabela leads
-- Issue: Model uses 'lead_metadata' but DB schema has 'metadata'
-- =============================================

\echo '🔧 Fixing lead metadata column name...'

-- Renomear coluna metadata para lead_metadata na tabela leads
ALTER TABLE leads RENAME COLUMN metadata TO lead_metadata;

\echo '✅ Column metadata renamed to lead_metadata'

-- ============================================================================
-- SCHEMA VERSION TRACKING
-- ============================================================================

-- Inserir versão desta migração
INSERT INTO schema_versions (version, description) 
VALUES (003, 'Fix: Rename leads.metadata column to leads.lead_metadata for model consistency')
ON CONFLICT (version) DO UPDATE SET 
    applied_at = NOW(),
    description = EXCLUDED.description;

\echo '🎉 Lead metadata column fix migration completed successfully!'