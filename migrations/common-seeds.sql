-- Common Seeds - Simplified for container initialization

\echo '📦 Loading common seeds...'

-- Create common data initialization function
CREATE OR REPLACE FUNCTION init_common_data() 
RETURNS text 
LANGUAGE plpgsql 
AS $$
DECLARE
    result_msg text := '';
BEGIN
    \echo '🏗️ Initializing common data...';
    
    -- Create base organizations
    INSERT INTO organizations (
        id, name, slug, description, owner_id, is_active,
        created_at, updated_at
    ) VALUES
    (
        '40000000-0000-0000-0000-000000000001'::uuid,
        'Acme Corp',
        'acme-corp',
        'Default organization for development',
        NULL,  -- Will be updated by dev seeds
        true,
        NOW(),
        NOW()
    ),
    (
        '40000000-0000-0000-0000-000000000002'::uuid,
        'Tech Solutions',
        'tech-solutions',
        'Technology solutions organization',
        NULL,  -- Will be updated by dev seeds
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;
    
    result_msg := 'Common data initialized successfully';
    \echo '✅ Common data initialization complete';
    RETURN result_msg;
END;
$$;

\echo '✅ Common seeds loaded successfully'