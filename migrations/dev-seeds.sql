-- Development Seeds for SaaS Starter
-- Rich sample data for development environment
-- Includes realistic users, organizations, and sample data

\echo '🏗️ Loading development-specific seeds...'

-- Ensure common seeds are loaded first
\i migrations/common-seeds.sql

-- Create comprehensive development users
CREATE OR REPLACE FUNCTION create_dev_users() 
RETURNS text 
LANGUAGE plpgsql 
AS $$
DECLARE
    result_msg text := '';
BEGIN
    \echo '👥 Creating development users...';
    
    -- All development users use "password123" for easier development
    INSERT INTO users (
        id, email, hashed_password, full_name, bio, location, 
        is_active, is_verified, is_superuser, created_at, updated_at, verified_at
    ) VALUES
    -- Business owners
    (
        '50000000-0000-0000-0000-000000000001'::uuid,
        'john.ceo@acmecorp.com',
        crypt('password123', gen_salt('bf')),
        'John CEO',
        'CEO of Acme Corp, passionate about innovation and growth.',
        'San Francisco, CA',
        true, true, false,
        NOW(), NOW(), NOW()
    ),
    (
        '50000000-0000-0000-0000-000000000002'::uuid,
        'sarah.founder@techsolutions.com',
        crypt('password123', gen_salt('bf')),
        'Sarah Chen',
        'Founder & CTO at Tech Solutions, building the future of SaaS.',
        'Austin, TX',
        true, true, false,
        NOW(), NOW(), NOW()
    ),
    (
        '50000000-0000-0000-0000-000000000003'::uuid,
        'mike.owner@startupxyz.com',
        crypt('password123', gen_salt('bf')),
        'Mike Rodriguez',
        'Startup founder, always learning and growing.',
        'Miami, FL',
        true, true, false,
        NOW(), NOW(), NOW()
    ),
    -- Team Members
    (
        '50000000-0000-0000-0000-000000000011'::uuid,
        'alice.dev@acmecorp.com',
        crypt('password123', gen_salt('bf')),
        'Alice Johnson',
        'Senior Developer, loves clean code and coffee.',
        'San Francisco, CA',
        true, true, false,
        NOW(), NOW(), NOW()
    ),
    (
        '50000000-0000-0000-0000-000000000012'::uuid,
        'bob.designer@acmecorp.com',
        crypt('password123', gen_salt('bf')),
        'Bob Smith',
        'UI/UX Designer, creating beautiful experiences.',
        'New York, NY',
        true, true, false,
        NOW(), NOW(), NOW()
    ),
    (
        '50000000-0000-0000-0000-000000000013'::uuid,
        'carol.marketing@techsolutions.com',
        crypt('password123', gen_salt('bf')),
        'Carol Williams',
        'Marketing Manager, growth hacking enthusiast.',
        'Austin, TX',
        true, true, false,
        NOW(), NOW(), NOW()
    ),
    (
        '50000000-0000-0000-0000-000000000014'::uuid,
        'david.sales@startupxyz.com',
        crypt('password123', gen_salt('bf')),
        'David Brown',
        'Sales Director, loves connecting with customers.',
        'Miami, FL',
        true, true, false,
        NOW(), NOW(), NOW()
    ),
    -- Test Cases
    (
        '50000000-0000-0000-0000-000000000021'::uuid,
        'inactive.user@example.com',
        crypt('password123', gen_salt('bf')),
        'Inactive User',
        'This user account is inactive for testing.',
        'Unknown',
        false, true, false,
        NOW(), NOW(), NOW()
    ),
    (
        '50000000-0000-0000-0000-000000000022'::uuid,
        'unverified@example.com',
        crypt('password123', gen_salt('bf')),
        'Unverified User',
        'Email not verified yet.',
        'Testing City',
        true, false, false,
        NOW(), NOW(), NULL
    ),
    (
        '50000000-0000-0000-0000-000000000023'::uuid,
        'jane.analyst@acmecorp.com',
        crypt('password123', gen_salt('bf')),
        'Jane Analyst',
        'Data Analyst, turning numbers into insights.',
        'Chicago, IL',
        true, true, false,
        NOW(), NOW(), NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
        hashed_password = EXCLUDED.hashed_password,
        full_name = EXCLUDED.full_name,
        bio = EXCLUDED.bio,
        location = EXCLUDED.location,
        is_active = EXCLUDED.is_active,
        is_verified = EXCLUDED.is_verified,
        updated_at = NOW();
    
    result_msg := 'Development users created successfully';
    \echo '✅ Development users created (password: password123)';
    RETURN result_msg;
END;
$$;

-- Create development organizations with proper ownership
CREATE OR REPLACE FUNCTION create_dev_organizations() 
RETURNS text 
LANGUAGE plpgsql 
AS $$
DECLARE
    john_id uuid;
    sarah_id uuid;
    mike_id uuid;
    acme_id uuid;
    tech_id uuid;
    startup_id uuid;
    result_msg text := '';
BEGIN
    \echo '🏢 Creating development organizations...';
    
    -- Get owner IDs
    SELECT id INTO john_id FROM users WHERE email = 'john.ceo@acmecorp.com' LIMIT 1;
    SELECT id INTO sarah_id FROM users WHERE email = 'sarah.founder@techsolutions.com' LIMIT 1;
    SELECT id INTO mike_id FROM users WHERE email = 'mike.owner@startupxyz.com' LIMIT 1;
    
    IF john_id IS NULL OR sarah_id IS NULL OR mike_id IS NULL THEN
        RAISE EXCEPTION 'Development users not found. Run create_dev_users() first.';
    END IF;
    
    -- Update existing base organizations with proper owners
    UPDATE organizations SET
        owner_id = john_id,
        name = 'Acme Corporation',
        description = 'Leading provider of enterprise solutions worldwide. Fortune 500 company with global operations.'
    WHERE slug = 'acme-corp';
    
    UPDATE organizations SET
        owner_id = sarah_id,
        name = 'Tech Solutions Inc',
        description = 'Innovative technology solutions for modern businesses. Specializing in AI and machine learning.'
    WHERE slug = 'tech-solutions';
    
    -- Create additional development organization
    startup_id := '60000000-0000-0000-0000-000000000001'::uuid;
    
    INSERT INTO organizations (
        id, name, slug, description, owner_id, is_active,
        created_at, updated_at
    ) VALUES (
        startup_id,
        'StartupXYZ',
        'startup-xyz',
        'Fast-growing startup disrupting the traditional industry with innovative solutions.',
        mike_id,
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        owner_id = EXCLUDED.owner_id,
        updated_at = NOW();
    
    -- Get organization IDs for memberships
    SELECT id INTO acme_id FROM organizations WHERE slug = 'acme-corp' LIMIT 1;
    SELECT id INTO tech_id FROM organizations WHERE slug = 'tech-solutions' LIMIT 1;
    
    -- Add team members to organizations
    INSERT INTO organization_members (organization_id, user_id, role, joined_at) VALUES
    -- Acme Corp team
    (acme_id, john_id, 'owner', NOW()),
    (acme_id, (SELECT id FROM users WHERE email = 'alice.dev@acmecorp.com'), 'admin', NOW()),
    (acme_id, (SELECT id FROM users WHERE email = 'bob.designer@acmecorp.com'), 'member', NOW()),
    (acme_id, (SELECT id FROM users WHERE email = 'jane.analyst@acmecorp.com'), 'member', NOW()),
    -- Tech Solutions team
    (tech_id, sarah_id, 'owner', NOW()),
    (tech_id, (SELECT id FROM users WHERE email = 'carol.marketing@techsolutions.com'), 'admin', NOW()),
    -- StartupXYZ team
    (startup_id, mike_id, 'owner', NOW()),
    (startup_id, (SELECT id FROM users WHERE email = 'david.sales@startupxyz.com'), 'member', NOW())
    ON CONFLICT (organization_id, user_id) DO UPDATE SET
        role = EXCLUDED.role,
        joined_at = EXCLUDED.joined_at;
    
    result_msg := 'Development organizations created successfully';
    \echo '✅ Development organizations and memberships created';
    RETURN result_msg;
END;
$$;

-- Main development data initialization function
CREATE OR REPLACE FUNCTION init_dev_data() 
RETURNS text 
LANGUAGE plpgsql 
AS $$
DECLARE
    result_msg text := '';
BEGIN
    \echo '🏗️ Initializing development data...';
    
    -- Initialize common data first
    PERFORM init_common_data();
    
    -- Add development-specific data
    PERFORM create_dev_users();
    PERFORM create_dev_organizations();
    
    result_msg := 'Development data initialized successfully';
    \echo '✅ Development data initialization complete';
    \echo '';
    \echo '🔑 Development Login Credentials:';
    \echo '   Admin: admin@saasrter.com / admin123';
    \echo '   CEO: john.ceo@acmecorp.com / password123';
    \echo '   Founder: sarah.founder@techsolutions.com / password123';
    \echo '   Developer: alice.dev@acmecorp.com / password123';
    \echo '   Designer: bob.designer@acmecorp.com / password123';
    \echo '🔗 Access: http://localhost:3000/auth/login';
    \echo '';
    
    RETURN result_msg;
END;
$$;

\echo '✅ Development seeds loaded successfully';