/**
 * Hook for managing role-based permissions.
 */
import { useMemo } from 'react'
import { useAuthStore } from '@/stores/auth'

// Define role hierarchy and permissions
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export interface Permissions {
  canEditOrganization: boolean
  canManageMembers: boolean
  canManageBilling: boolean
  canDeleteOrganization: boolean
  canViewAdvancedSettings: boolean
  canManageSettings: boolean
}

/**
 * Get user role from organization memberships
 */
function getUserRole(user: any): UserRole | null {
  if (!user?.organization_memberships?.length) {
    return null
  }

  // Assume first membership for now - in real app might need to handle multiple orgs
  const membership = user.organization_memberships[0]
  return membership.role as UserRole
}

/**
 * Calculate permissions based on user role
 */
function calculatePermissions(role: UserRole | null): Permissions {
  switch (role) {
    case UserRole.OWNER: {
      return {
        canEditOrganization: true,
        canManageMembers: true,
        canManageBilling: true,
        canDeleteOrganization: true,
        canViewAdvancedSettings: true,
        canManageSettings: true,
      }
    }

    case UserRole.ADMIN: {
      return {
        canEditOrganization: true,
        canManageMembers: true,
        canManageBilling: false,
        canDeleteOrganization: false,
        canViewAdvancedSettings: true,
        canManageSettings: true,
      }
    }

    case UserRole.MEMBER: {
      return {
        canEditOrganization: false,
        canManageMembers: false,
        canManageBilling: false,
        canDeleteOrganization: false,
        canViewAdvancedSettings: false,
        canManageSettings: true, // Can manage their own settings
      }
    }

    default: {
      return {
        canEditOrganization: false,
        canManageMembers: false,
        canManageBilling: false,
        canDeleteOrganization: false,
        canViewAdvancedSettings: false,
        canManageSettings: false,
      }
    }
  }
}

/**
 * Hook to get current user role and permissions
 */
export function usePermissions() {
  const { user } = useAuthStore()

  const userRole = useMemo(() => getUserRole(user), [user])
  const permissions = useMemo(() => calculatePermissions(userRole), [userRole])

  const hasRole = (role: UserRole) => userRole === role
  const hasAnyRole = (roles: UserRole[]) => (userRole ? roles.includes(userRole) : false)
  const isAtLeastRole = (role: UserRole) => {
    if (!userRole) return false

    const roleHierarchy = [UserRole.MEMBER, UserRole.ADMIN, UserRole.OWNER]
    const userRoleIndex = roleHierarchy.indexOf(userRole)
    const requiredRoleIndex = roleHierarchy.indexOf(role)

    return userRoleIndex >= requiredRoleIndex
  }

  return {
    userRole,
    permissions,
    hasRole,
    hasAnyRole,
    isAtLeastRole,
    isOwner: userRole === UserRole.OWNER,
    isAdmin: userRole === UserRole.ADMIN,
    isMember: userRole === UserRole.MEMBER,
    isOwnerOrAdmin: hasAnyRole([UserRole.OWNER, UserRole.ADMIN]),
  }
}
