'use client'

// Role Guard Components - Permission-Based UI Rendering

import React from 'react'

import { renderAccessDeniedContent } from './role-guard-components'
import {
  Role,
  type RoleGuardProps,
  type PermissionCheckProps,
  type Permission,
} from './role-guard-types'
import { normalizeRole, hasRequiredRole, hasPermission } from './role-guard-utils'

// Main RoleGuard component
export function RoleGuard({
  children,
  requiredRole,
  requiredPermission,
  currentUserRole,
  fallback,
  mode = 'hide',
  showReason = false,
  className = '',
}: RoleGuardProps): JSX.Element | null {
  const currentRole = normalizeRole(currentUserRole)

  // Check role requirements
  const hasRoleAccess =
    requiredRole === null ||
    requiredRole === undefined ||
    hasRequiredRole(currentRole, requiredRole)

  // Check permission requirements
  const hasPermissionAccess =
    requiredPermission === null ||
    requiredPermission === undefined ||
    hasPermission(currentRole, requiredPermission)

  // Determine if access should be granted
  const hasAccess = hasRoleAccess && hasPermissionAccess

  // If access is granted, render children
  if (hasAccess) {
    return <div className={className}>{children}</div>
  }

  // Handle access denied cases
  switch (mode) {
    case 'hide': {
      return null
    }

    case 'disable': {
      return <div className={`opacity-50 pointer-events-none ${className}`}>{children}</div>
    }

    case 'replace': {
      return renderAccessDeniedContent({
        currentRole,
        requiredRole,
        requiredPermission,
        fallback,
        showReason,
        className,
      })
    }

    default: {
      return null
    }
  }
}

// Permission-specific guard component
export function PermissionGuard({
  permission,
  currentUserRole,
  children,
  fallback,
  mode = 'hide',
}: PermissionCheckProps): JSX.Element | null {
  return (
    <RoleGuard
      requiredPermission={permission}
      currentUserRole={currentUserRole}
      fallback={fallback}
      mode={mode}
    >
      {children}
    </RoleGuard>
  )
}

// Specialized guards - use RoleGuard directly for custom needs
export function AdminOnlyGuard(props: Omit<RoleGuardProps, 'requiredRole'>): JSX.Element | null {
  return <RoleGuard requiredRole={Role.ADMIN} {...props} />
}

export function OwnerOnlyGuard(props: Omit<RoleGuardProps, 'requiredRole'>): JSX.Element | null {
  return <RoleGuard requiredRole={Role.OWNER} {...props} />
}

export function MemberOrAboveGuard(
  props: Omit<RoleGuardProps, 'requiredRole'>
): JSX.Element | null {
  return <RoleGuard requiredRole={Role.MEMBER} {...props} />
}

// Role-based button wrapper
interface RoleBasedButtonProps extends RoleGuardProps {
  onClick?: () => void
  disabled?: boolean
  [key: string]: unknown
}

export function RoleBasedButton({
  children,
  requiredRole,
  requiredPermission,
  currentUserRole,
  onClick,
  disabled,
  className = '',
  ...props
}: RoleBasedButtonProps): JSX.Element {
  const currentRole = normalizeRole(currentUserRole)
  const hasRoleAccess =
    requiredRole === null ||
    requiredRole === undefined ||
    hasRequiredRole(currentRole, requiredRole)
  const hasPermissionAccess =
    requiredPermission === null ||
    requiredPermission === undefined ||
    hasPermission(currentRole, requiredPermission)
  const hasAccess = hasRoleAccess && hasPermissionAccess

  return (
    <button
      type="button"
      onClick={hasAccess ? onClick : undefined}
      disabled={disabled === true || !hasAccess}
      className={className}
      title={hasAccess ? undefined : 'Insufficient permissions'}
      {...props}
    >
      {children}
    </button>
  )
}

// Utility hook - basic permissions checking
export function useRolePermissions(currentUserRole?: string): {
  role: Role
  hasRole: (r: Role | Role[]) => boolean
  hasPermission: (p: Permission | Permission[]) => boolean
} {
  const currentRole = normalizeRole(currentUserRole)
  return {
    role: currentRole,
    hasRole: (requiredRole: Role | Role[]) => hasRequiredRole(currentRole, requiredRole),
    hasPermission: (permission: Permission | Permission[]) =>
      hasPermission(currentRole, permission),
  }
}

// Export everything from the component modules
export * from './role-guard-types'
export * from './role-guard-utils'
export * from './role-guard-components'
