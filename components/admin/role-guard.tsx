"use client"

// Role Guard Components - Permission-Based UI Rendering

import { AlertTriangle, Lock } from 'lucide-react'
import React from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export enum Role { OWNER = 'owner', ADMIN = 'admin', MEMBER = 'member', VIEWER = 'viewer' }

const ROLE_LEVELS = { [Role.VIEWER]: 1, [Role.MEMBER]: 2, [Role.ADMIN]: 3, [Role.OWNER]: 4 } as const

export type Permission = 'manage_organization' | 'manage_members' | 'manage_roles' | 'manage_billing' | 'manage_settings' | 'view_audit_logs' | 'export_data' | 'delete_organization' | 'view_members' | 'manage_leads' | 'view_leads' | 'manage_communications' | 'view_communications'

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: ['manage_organization', 'manage_members', 'manage_roles', 'manage_billing', 'manage_settings', 'view_audit_logs', 'export_data', 'delete_organization', 'view_members', 'manage_leads', 'view_leads', 'manage_communications', 'view_communications'],
  [Role.ADMIN]: ['manage_members', 'manage_roles', 'manage_settings', 'view_audit_logs', 'export_data', 'view_members', 'manage_leads', 'view_leads', 'manage_communications', 'view_communications'],
  [Role.MEMBER]: ['view_members', 'manage_leads', 'view_leads', 'manage_communications', 'view_communications'],
  [Role.VIEWER]: ['view_leads', 'view_communications'],
}
interface RoleGuardProps {
  children: React.ReactNode
  requiredRole?: Role | Role[]
  requiredPermission?: Permission | Permission[]
  currentUserRole?: string
  fallback?: React.ReactNode
  mode?: 'hide' | 'disable' | 'replace'
  showReason?: boolean
  className?: string
}
interface PermissionCheckProps {
  permission: Permission | Permission[]
  currentUserRole?: string
  children: React.ReactNode
  fallback?: React.ReactNode
  mode?: 'hide' | 'disable' | 'replace'
}
function normalizeRole(role?: string): Role {
  if (typeof role !== 'string' || role.trim() === '') {return Role.VIEWER}
  const lowerRole = role.toLowerCase()
  return Object.values(Role).includes(lowerRole as Role) ? (lowerRole as Role) : Role.VIEWER
}
function getRoleLevel(role: Role): number {
  return ROLE_LEVELS[role] ?? ROLE_LEVELS[Role.VIEWER]
}
function hasRequiredRole(currentRole: Role, requiredRole: Role | Role[]): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.some(role => getRoleLevel(currentRole) >= getRoleLevel(role))
  }
  return getRoleLevel(currentRole) >= getRoleLevel(requiredRole)
}
function hasPermission(currentRole: Role, permission: Permission | Permission[]): boolean {
  const userPermissions = ROLE_PERMISSIONS[currentRole] ?? []
  if (Array.isArray(permission)) {
    return permission.some(p => userPermissions.includes(p))
  }
  return userPermissions.includes(permission)
}
function getRequiredRoleLabel(requiredRole: Role | Role[]): string {
  if (Array.isArray(requiredRole)) {
    return requiredRole.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(' or ')
  }
  return requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)
}
// Default fallback components
function AccessDeniedCard({ 
  reason, 
  currentRole, 
  requiredRole,
  requiredPermission: _requiredPermission 
}: {
  reason?: string
  currentRole: Role
  requiredRole?: Role | Role[]
  requiredPermission?: Permission | Permission[]
}): JSX.Element {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Lock className="h-5 w-5" />
          Access Denied
        </CardTitle>
        <CardDescription>
          {reason ?? 'You do not have sufficient permissions to access this content.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Your role:</span>
          <Badge variant="outline">{currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}</Badge>
        </div>
        
{requiredRole === undefined ? null : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Required role:</span>
              <Badge variant="secondary">{getRequiredRoleLabel(requiredRole)}</Badge>
            </div>
          )}
        
        {Boolean(_requiredPermission) && <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Required permission:</span>
            <Badge variant="outline" className="font-mono text-xs">
              {Array.isArray(_requiredPermission) ? _requiredPermission.join(', ') : _requiredPermission}
            </Badge>
          </div>}
      </CardContent>
    </Card>
  )
}

function AccessDeniedAlert({ 
  currentRole,
  requiredRole,
  requiredPermission: _requiredPermission 
}: {
  currentRole: Role
  requiredRole?: Role | Role[]
  requiredPermission?: Permission | Permission[]
}): JSX.Element {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        This action requires {requiredRole === undefined ? 'additional permissions' : `${getRequiredRoleLabel(requiredRole)} role`}.
        Your current role: <Badge variant="outline" className="ml-1">{currentRole}</Badge>
      </AlertDescription>
    </Alert>
  )
}

// Helper function to render access denied content
function renderAccessDeniedContent(props: {
  currentRole: Role
  requiredRole?: Role | Role[]
  requiredPermission?: Permission | Permission[]
  fallback?: React.ReactNode
  showReason?: boolean
  className?: string
}): JSX.Element {
  const { currentRole, requiredRole, requiredPermission, fallback, showReason, className } = props
  if (fallback === undefined) {
    // Continue to next condition
  } else {
    return <div className={className}>{fallback}</div>
  }
  
  if (showReason === true) {
    return (
      <div className={className}>
        <AccessDeniedCard
          currentRole={currentRole}
          requiredRole={requiredRole}
          requiredPermission={requiredPermission}
        />
      </div>
    )
  }
  
  return (
    <div className={className}>
      <AccessDeniedAlert
        currentRole={currentRole}
        requiredRole={requiredRole}
        requiredPermission={requiredPermission}
      />
    </div>
  )
}

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
  const hasRoleAccess = requiredRole === undefined ? true : hasRequiredRole(currentRole, requiredRole)
  
  // Check permission requirements
  const hasPermissionAccess = requiredPermission === undefined
    ? true
    : hasPermission(currentRole, requiredPermission)
  
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
      return (
        <div className={`opacity-50 pointer-events-none ${className}`}>
          {children}
        </div>
      )
    }
      
    case 'replace': {
      return renderAccessDeniedContent({
        currentRole,
        requiredRole,
        requiredPermission,
        fallback,
        showReason,
        className
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
export function AdminOnlyGuard(props: Omit<RoleGuardProps, 'requiredRole'>): JSX.Element | null { return <RoleGuard requiredRole={Role.ADMIN} {...props} /> }
export function OwnerOnlyGuard(props: Omit<RoleGuardProps, 'requiredRole'>): JSX.Element | null { return <RoleGuard requiredRole={Role.OWNER} {...props} /> }
export function MemberOrAboveGuard(props: Omit<RoleGuardProps, 'requiredRole'>): JSX.Element | null { return <RoleGuard requiredRole={Role.MEMBER} {...props} /> }

// Role-based button wrapper
export function RoleBasedButton({
  children,
  requiredRole,
  requiredPermission,
  currentUserRole,
  onClick,
  disabled,
  className = '',
  ...props
}: RoleGuardProps & {
  onClick?: () => void
  disabled?: boolean
  [key: string]: unknown
}): JSX.Element {
  const currentRole = normalizeRole(currentUserRole)
  const hasRoleAccess = requiredRole === undefined ? true : hasRequiredRole(currentRole, requiredRole)
  const hasPermissionAccess = requiredPermission === undefined
    ? true
    : hasPermission(currentRole, requiredPermission)
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
export function usePermissions(currentUserRole?: string): { role: Role; hasRole: (r: Role | Role[]) => boolean; hasPermission: (p: Permission | Permission[]) => boolean } {
  const currentRole = normalizeRole(currentUserRole)
  return {
    role: currentRole,
    hasRole: (requiredRole: Role | Role[]) => hasRequiredRole(currentRole, requiredRole),
    hasPermission: (permission: Permission | Permission[]) => hasPermission(currentRole, permission),
  }
}

// Export role-related utilities
export { ROLE_LEVELS, ROLE_PERMISSIONS, normalizeRole, getRoleLevel, hasRequiredRole, hasPermission }