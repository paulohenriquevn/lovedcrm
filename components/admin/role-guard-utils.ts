/**
 * Role Guard Utility Functions
 * Helper functions for role and permission checking
 */

import { Role, ROLE_LEVELS, ROLE_PERMISSIONS, type Permission } from './role-guard-types'

export function normalizeRole(role?: string): Role {
  if (typeof role !== 'string' || role.trim() === '') {
    return Role.VIEWER
  }
  const lowerRole = role.toLowerCase()
  return Object.values(Role).includes(lowerRole as Role) ? (lowerRole as Role) : Role.VIEWER
}

export function getRoleLevel(role: Role): number {
  return ROLE_LEVELS[role] ?? ROLE_LEVELS[Role.VIEWER]
}

export function hasRequiredRole(currentRole: Role, requiredRole: Role | Role[]): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.some(role => getRoleLevel(currentRole) >= getRoleLevel(role))
  }
  return getRoleLevel(currentRole) >= getRoleLevel(requiredRole)
}

export function hasPermission(currentRole: Role, permission: Permission | Permission[]): boolean {
  const userPermissions = ROLE_PERMISSIONS[currentRole] ?? []
  if (Array.isArray(permission)) {
    return permission.some(p => userPermissions.includes(p))
  }
  return userPermissions.includes(permission)
}

export function getRequiredRoleLabel(requiredRole: Role | Role[]): string {
  if (Array.isArray(requiredRole)) {
    return requiredRole.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(' or ')
  }
  return requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)
}
