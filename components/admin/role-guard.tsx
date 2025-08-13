"use client"

/**
 * 🛡️ Role Guard Components - Permission-Based UI Rendering
 * 
 * Components that conditionally render content based on user roles and permissions.
 * Implements role hierarchy: Owner > Admin > Member > Viewer
 */

import React from 'react'
import { AlertTriangle, Lock } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Role hierarchy definition
export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin', 
  MEMBER = 'member',
  VIEWER = 'viewer',
}

// Role hierarchy levels (higher number = more permissions)
const ROLE_LEVELS = {
  [Role.VIEWER]: 1,
  [Role.MEMBER]: 2,
  [Role.ADMIN]: 3,
  [Role.OWNER]: 4,
} as const

// All possible permissions
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

// Permission sets by role
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
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
  [Role.VIEWER]: [
    'view_leads',
    'view_communications',
  ],
}

// Types
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

// Helper functions
function normalizeRole(role?: string): Role {
  if (!role) return Role.VIEWER
  const lowerRole = role.toLowerCase()
  return Object.values(Role).find(r => r === lowerRole) || Role.VIEWER
}

function getRoleLevel(role: Role): number {
  return ROLE_LEVELS[role] || ROLE_LEVELS[Role.VIEWER]
}

function hasRequiredRole(currentRole: Role, requiredRole: Role | Role[]): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.some(role => getRoleLevel(currentRole) >= getRoleLevel(role))
  }
  return getRoleLevel(currentRole) >= getRoleLevel(requiredRole)
}

function hasPermission(currentRole: Role, permission: Permission | Permission[]): boolean {
  const userPermissions = ROLE_PERMISSIONS[currentRole] || []
  
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
  requiredPermission 
}: {
  reason?: string
  currentRole: Role
  requiredRole?: Role | Role[]
  requiredPermission?: Permission | Permission[]
}) {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Lock className="h-5 w-5" />
          Access Denied
        </CardTitle>
        <CardDescription>
          {reason || 'You do not have sufficient permissions to access this content.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Your role:</span>
          <Badge variant="outline">{currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}</Badge>
        </div>
        
        {requiredRole && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Required role:</span>
            <Badge variant="secondary">{getRequiredRoleLabel(requiredRole)}</Badge>
          </div>
        )}
        
        {requiredPermission && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Required permission:</span>
            <Badge variant="outline" className="font-mono text-xs">
              {Array.isArray(requiredPermission) ? requiredPermission.join(', ') : requiredPermission}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AccessDeniedAlert({ 
  currentRole,
  requiredRole,
  requiredPermission 
}: {
  currentRole: Role
  requiredRole?: Role | Role[]
  requiredPermission?: Permission | Permission[]
}) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        This action requires {requiredRole ? `${getRequiredRoleLabel(requiredRole)} role` : 'additional permissions'}.
        Your current role: <Badge variant="outline" className="ml-1">{currentRole}</Badge>
      </AlertDescription>
    </Alert>
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
}: RoleGuardProps) {
  const currentRole = normalizeRole(currentUserRole)
  
  // Check role requirements
  const hasRoleAccess = requiredRole ? hasRequiredRole(currentRole, requiredRole) : true
  
  // Check permission requirements
  const hasPermissionAccess = requiredPermission 
    ? hasPermission(currentRole, requiredPermission) 
    : true
  
  // Determine if access should be granted
  const hasAccess = hasRoleAccess && hasPermissionAccess
  
  // If access is granted, render children
  if (hasAccess) {
    return <div className={className}>{children}</div>
  }
  
  // Handle access denied cases
  switch (mode) {
    case 'hide':
      return null
      
    case 'disable':
      return (
        <div className={`opacity-50 pointer-events-none ${className}`}>
          {children}
        </div>
      )
      
    case 'replace':
      if (fallback) {
        return <div className={className}>{fallback}</div>
      }
      
      if (showReason) {
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
      
    default:
      return null
  }
}

// Permission-specific guard component
export function PermissionGuard({
  permission,
  currentUserRole,
  children,
  fallback,
  mode = 'hide',
}: PermissionCheckProps) {
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

// Specialized role guards for common use cases
export function AdminOnlyGuard({
  children,
  currentUserRole,
  fallback,
  mode = 'hide',
}: Omit<RoleGuardProps, 'requiredRole'>) {
  return (
    <RoleGuard
      requiredRole={Role.ADMIN}
      currentUserRole={currentUserRole}
      fallback={fallback}
      mode={mode}
    >
      {children}
    </RoleGuard>
  )
}

export function OwnerOnlyGuard({
  children,
  currentUserRole,
  fallback,
  mode = 'hide',
}: Omit<RoleGuardProps, 'requiredRole'>) {
  return (
    <RoleGuard
      requiredRole={Role.OWNER}
      currentUserRole={currentUserRole}
      fallback={fallback}
      mode={mode}
    >
      {children}
    </RoleGuard>
  )
}

export function MemberOrAboveGuard({
  children,
  currentUserRole,
  fallback,
  mode = 'hide',
}: Omit<RoleGuardProps, 'requiredRole'>) {
  return (
    <RoleGuard
      requiredRole={Role.MEMBER}
      currentUserRole={currentUserRole}
      fallback={fallback}
      mode={mode}
    >
      {children}
    </RoleGuard>
  )
}

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
  [key: string]: any
}) {
  const currentRole = normalizeRole(currentUserRole)
  const hasRoleAccess = requiredRole ? hasRequiredRole(currentRole, requiredRole) : true
  const hasPermissionAccess = requiredPermission 
    ? hasPermission(currentRole, requiredPermission) 
    : true
  const hasAccess = hasRoleAccess && hasPermissionAccess
  
  return (
    <button
      onClick={hasAccess ? onClick : undefined}
      disabled={disabled || !hasAccess}
      className={className}
      title={hasAccess ? undefined : 'Insufficient permissions'}
      {...props}
    >
      {children}
    </button>
  )
}

// Utility hook for checking permissions in components
export function usePermissions(currentUserRole?: string) {
  const currentRole = normalizeRole(currentUserRole)
  
  return {
    role: currentRole,
    level: getRoleLevel(currentRole),
    permissions: ROLE_PERMISSIONS[currentRole] || [],
    
    hasRole: (requiredRole: Role | Role[]) => hasRequiredRole(currentRole, requiredRole),
    hasPermission: (permission: Permission | Permission[]) => hasPermission(currentRole, permission),
    
    isOwner: currentRole === Role.OWNER,
    isAdmin: getRoleLevel(currentRole) >= getRoleLevel(Role.ADMIN),
    isMember: getRoleLevel(currentRole) >= getRoleLevel(Role.MEMBER),
    isViewer: currentRole === Role.VIEWER,
    
    canManageMembers: hasPermission(currentRole, 'manage_members'),
    canManageRoles: hasPermission(currentRole, 'manage_roles'),
    canViewAuditLogs: hasPermission(currentRole, 'view_audit_logs'),
    canManageOrganization: hasPermission(currentRole, 'manage_organization'),
  }
}

// Export role-related utilities
export { ROLE_LEVELS, ROLE_PERMISSIONS, normalizeRole, getRoleLevel, hasRequiredRole, hasPermission }

// Default export
export default RoleGuard