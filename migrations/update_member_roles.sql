-- Update organization members to use new role enum
-- Phase 3.3: Advanced Role System

\echo '🚀 Updating organization member roles...'

-- Add new role column with enum type (parallel to existing role column)
ALTER TABLE organization_members 
ADD COLUMN role_enum organization_role;

-- Map existing string roles to enum values
UPDATE organization_members 
SET role_enum = CASE 
    WHEN role = 'owner' THEN 'owner'::organization_role
    WHEN role = 'admin' THEN 'admin'::organization_role
    WHEN role = 'member' THEN 'member'::organization_role
    ELSE 'member'::organization_role  -- Default fallback
END;

-- Make the enum column NOT NULL after data migration
ALTER TABLE organization_members 
ALTER COLUMN role_enum SET NOT NULL;

-- Add default value for new records
ALTER TABLE organization_members 
ALTER COLUMN role_enum SET DEFAULT 'member'::organization_role;

-- Drop the old string role column
ALTER TABLE organization_members 
DROP COLUMN role;

-- Rename the enum column to role
ALTER TABLE organization_members 
RENAME COLUMN role_enum TO role;

-- Create index on the new role column
CREATE INDEX idx_organization_members_role_enum ON organization_members(role);

-- Update existing composite indexes to use new role column
DROP INDEX IF EXISTS idx_org_members_active_role;
CREATE INDEX idx_org_members_active_role ON organization_members(is_active, role);

\echo '✅ Organization member roles updated successfully'

-- Show updated table structure
\d organization_members;