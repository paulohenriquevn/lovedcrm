/**
 * Role Guard Components
 * Access denied UI components for role guards
 */

import { AlertTriangle, Lock } from 'lucide-react'
import React from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { type Role, type Permission } from './role-guard-types'
import { getRequiredRoleLabel } from './role-guard-utils'

interface AccessDeniedCardProps {
  reason?: string
  currentRole: Role
  requiredRole?: Role | Role[]
  requiredPermission?: Permission | Permission[]
}

export function AccessDeniedCard({
  reason,
  currentRole,
  requiredRole,
  requiredPermission,
}: AccessDeniedCardProps): JSX.Element {
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
          <Badge variant="outline">
            {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
          </Badge>
        </div>

        {requiredRole !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Required role:</span>
            <Badge variant="secondary">
              {requiredRole ? getRequiredRoleLabel(requiredRole) : 'Unknown'}
            </Badge>
          </div>
        )}

        {requiredPermission !== null && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Required permission:</span>
            <Badge variant="outline" className="font-mono text-xs">
              {Array.isArray(requiredPermission)
                ? requiredPermission.join(', ')
                : requiredPermission}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface AccessDeniedAlertProps {
  currentRole: Role
  requiredRole?: Role | Role[]
  requiredPermission?: Permission | Permission[]
}

export function AccessDeniedAlert({
  currentRole,
  requiredRole,
  requiredPermission: _requiredPermission,
}: AccessDeniedAlertProps): JSX.Element {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        This action requires{' '}
        {requiredRole ? `${getRequiredRoleLabel(requiredRole)} role` : 'additional permissions'}.
        Your current role:{' '}
        <Badge variant="outline" className="ml-1">
          {currentRole}
        </Badge>
      </AlertDescription>
    </Alert>
  )
}

// Helper function to render access denied content
export function renderAccessDeniedContent(props: {
  currentRole: Role
  requiredRole?: Role | Role[]
  requiredPermission?: Permission | Permission[]
  fallback?: React.ReactNode
  showReason?: boolean
  className?: string
}): JSX.Element {
  const { currentRole, requiredRole, requiredPermission, fallback, showReason, className } = props

  if (fallback !== null) {
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
