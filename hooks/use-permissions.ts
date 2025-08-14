'use client'

/**
 * 🔐 usePermissions Hook - Enhanced Role-Based Permissions
 *
 * Comprehensive hook for role-based access control that integrates with
 * the organization context and provides fine-grained permission checking.
 *
 * Supports the 4-tier role hierarchy: Owner > Admin > Member > Viewer
 */

import { useMemo } from 'react'

import { useOrgContext } from '@/hooks/use-org-context'
import { useAuthStore } from '@/stores/auth'
import {
  Role,
  Permission,
  ROLE_PERMISSIONS,
  getRoleLevel,
  hasPermission,
  hasRequiredRole,
  normalizeRole,
} from '@/components/admin/role-guard'

// Legacy compatibility - map to Role enum
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

// Enhanced permissions interface with comprehensive coverage
export interface Permissions {
  // Organization Management
  canManageOrganization: boolean
  canDeleteOrganization: boolean
  canEditOrganization: boolean

  // Member Management
  canManageMembers: boolean
  canViewMembers: boolean
  canManageRoles: boolean

  // Financial & Billing
  canManageBilling: boolean

  // Settings & Configuration
  canManageSettings: boolean
  canViewAdvancedSettings: boolean

  // Data & Exports
  canExportData: boolean
  canViewAuditLogs: boolean

  // CRM & Business Operations
  canManageLeads: boolean
  canViewLeads: boolean
  canManageCommunications: boolean
  canViewCommunications: boolean

  // System Administration
  canManageProviders: boolean

  // Legacy permissions for backward compatibility
  canViewAuditTrail: boolean
}

/**
 * Get user role from organization context and auth store
 */
function getUserRole(user: any): Role {
  if (!user?.role) {
    return Role.VIEWER
  }

  return normalizeRole(user.role)
}

/**
 * Calculate comprehensive permissions based on user role
 */
function calculatePermissions(role: Role): Permissions {
  const rolePermissions = ROLE_PERMISSIONS[role] || []

  return {
    // Organization Management
    canManageOrganization: rolePermissions.includes('manage_organization'),
    canDeleteOrganization: rolePermissions.includes('delete_organization'),
    canEditOrganization: rolePermissions.includes('manage_organization'),

    // Member Management
    canManageMembers: rolePermissions.includes('manage_members'),
    canViewMembers: rolePermissions.includes('view_members'),
    canManageRoles: rolePermissions.includes('manage_roles'),

    // Financial & Billing
    canManageBilling: rolePermissions.includes('manage_billing'),

    // Settings & Configuration
    canManageSettings: rolePermissions.includes('manage_settings'),
    canViewAdvancedSettings:
      rolePermissions.includes('view_audit_logs') || rolePermissions.includes('manage_settings'),

    // Data & Exports
    canExportData: rolePermissions.includes('export_data'),
    canViewAuditLogs: rolePermissions.includes('view_audit_logs'),

    // CRM & Business Operations
    canManageLeads: rolePermissions.includes('manage_leads'),
    canViewLeads: rolePermissions.includes('view_leads'),
    canManageCommunications: rolePermissions.includes('manage_communications'),
    canViewCommunications: rolePermissions.includes('view_communications'),

    // System Administration
    canManageProviders: rolePermissions.includes('manage_organization'), // High-level permission

    // Legacy compatibility
    canViewAuditTrail: rolePermissions.includes('view_audit_logs'),
  }
}

/**
 * Enhanced usePermissions hook with comprehensive role-based access control
 */
export function usePermissions() {
  const orgContext = useOrgContext()
  const { user } = useAuthStore()

  const userRole = useMemo(() => getUserRole(user), [user])
  const permissions = useMemo(() => calculatePermissions(userRole), [userRole])
  const userPermissions = useMemo(() => ROLE_PERMISSIONS[userRole] || [], [userRole])

  // Role checking functions
  const hasRole = (role: Role) => userRole === role
  const hasAnyRole = (roles: Role[]) => roles.includes(userRole)
  const isAtLeastRole = (role: Role) => getRoleLevel(userRole) >= getRoleLevel(role)

  // Permission checking functions
  const hasSpecificPermission = (permission: Permission | Permission[]) => {
    return hasPermission(userRole, permission)
  }

  const canPerformAction = (
    requiredRole: Role | Role[],
    requiredPermission?: Permission | Permission[]
  ) => {
    const hasRoleAccess = hasRequiredRole(userRole, requiredRole)
    const hasPermissionAccess = requiredPermission
      ? hasPermission(userRole, requiredPermission)
      : true
    return hasRoleAccess && hasPermissionAccess
  }

  // Role level information
  const roleLevel = getRoleLevel(userRole)
  const roleLabel = userRole.charAt(0).toUpperCase() + userRole.slice(1)

  // Quick role checks
  const isOwner = userRole === Role.OWNER
  const isAdmin = getRoleLevel(userRole) >= getRoleLevel(Role.ADMIN)
  const isMember = getRoleLevel(userRole) >= getRoleLevel(Role.MEMBER)
  const isViewer = userRole === Role.VIEWER
  const isOwnerOrAdmin = isOwner || getRoleLevel(userRole) >= getRoleLevel(Role.ADMIN)

  // Legacy UserRole compatibility
  const legacyRole = userRole as unknown as UserRole

  return {
    // Role information
    role: userRole,
    userRole: legacyRole, // Legacy compatibility
    roleLevel,
    roleLabel,
    permissions: userPermissions,

    // Permission object
    can: permissions,

    // Role checking functions
    hasRole,
    hasAnyRole,
    isAtLeastRole,
    hasPermission: hasSpecificPermission,
    canPerformAction,

    // Quick role checks
    isOwner,
    isAdmin,
    isMember,
    isViewer,
    isOwnerOrAdmin,

    // Convenience permission checks (commonly used)
    canManageMembers: permissions.canManageMembers,
    canManageRoles: permissions.canManageRoles,
    canViewAuditLogs: permissions.canViewAuditLogs,
    canManageOrganization: permissions.canManageOrganization,
    canManageSettings: permissions.canManageSettings,
    canExportData: permissions.canExportData,
    canManageLeads: permissions.canManageLeads,
    canViewLeads: permissions.canViewLeads,

    // Organization context (if available)
    organization: orgContext?.organization,
    user: user,
  }
}

// Export role constants for convenience
export { Role }
export type { Role as EnhancedRole }

// Default export
export default usePermissions
