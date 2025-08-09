-- Migration 004: Fix communication metadata column name mismatch
-- Issue: Model expects 'comm_metadata' but database has 'metadata'
-- This mismatch prevents cascade delete operations on leads with communications

ALTER TABLE communications RENAME COLUMN metadata TO comm_metadata;

-- Update version tracking
INSERT INTO schema_versions (version, description) VALUES (4, 'Fix communication metadata column name to match model');