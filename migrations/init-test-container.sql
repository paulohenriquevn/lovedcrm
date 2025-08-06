-- Test container initialization for Docker environments

\echo '🧪 Initializing test container...'

-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema if not exists (for test containers)
CREATE SCHEMA IF NOT EXISTS public;

-- Ensure proper permissions
GRANT ALL ON SCHEMA public TO PUBLIC;

\echo '✅ Test container initialized successfully'