/**
 * Role Guard Types and Enums
 * Shared types for permission-based UI rendering
 */

export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export const ROLE_LEVELS = {
  [Role.VIEWER]: 1,
  [Role.MEMBER]: 2,
  [Role.ADMIN]: 3,
  [Role.OWNER]: 4,
} as const

export type Permission =
  | 'manage_organization'
  | 'manage_members'
  | 'manage_roles'
  | 'manage_billing'
  | 'manage_settings'
  | 'view_audit_logs'
  | 'export_data'
  | 'delete_organization'
  | 'view_members'
  | 'manage_leads'
  | 'view_leads'
  | 'manage_communications'
  | 'view_communications'

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: [
    'manage_organization',
    'manage_members',
    'manage_roles',
    'manage_billing',
    'manage_settings',
    'view_audit_logs',
    'export_data',
    'delete_organization',
    'view_members',
    'manage_leads',
    'view_leads',
    'manage_communications',
    'view_communications',
  ],
  [Role.ADMIN]: [
    'manage_members',
    'manage_roles',
    'manage_settings',
    'view_audit_logs',
    'export_data',
    'view_members',
    'manage_leads',
    'view_leads',
    'manage_communications',
    'view_communications',
  ],
  [Role.MEMBER]: [
    'view_members',
    'manage_leads',
    'view_leads',
    'manage_communications',
    'view_communications',
  ],
  [Role.VIEWER]: ['view_leads', 'view_communications'],
}

export interface RoleGuardProps {
  children: React.ReactNode
  requiredRole?: Role | Role[]
  requiredPermission?: Permission | Permission[]
  currentUserRole?: string
  fallback?: React.ReactNode
  mode?: 'hide' | 'disable' | 'replace'
  showReason?: boolean
  className?: string
}

export interface PermissionCheckProps {
  permission: Permission | Permission[]
  currentUserRole?: string
  children: React.ReactNode
  fallback?: React.ReactNode
  mode?: 'hide' | 'disable' | 'replace'
}
