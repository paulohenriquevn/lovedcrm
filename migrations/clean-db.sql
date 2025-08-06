-- clean-db.sql
-- Clean database script - removes all data but keeps schema

\echo '🧹 Cleaning database (keeping schema)...'

-- Disable foreign key checks temporarily
SET session_replication_role = replica;

-- Clean all tables in reverse dependency order
-- (Most dependent tables first)
TRUNCATE TABLE organization_subscriptions CASCADE;
TRUNCATE TABLE organization_invites CASCADE;
TRUNCATE TABLE organization_members CASCADE;
TRUNCATE TABLE organizations CASCADE;  
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE plans CASCADE;
TRUNCATE TABLE schema_versions CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Reset sequences if needed
-- (UUIDs don't need sequence reset)

\echo '✅ Database cleaned successfully - schema preserved'
SELECT 'Database cleaned successfully' as result;