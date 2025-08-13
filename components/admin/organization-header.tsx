"use client"

/**
 * 🏢 Organization Context Header - Multi-Tenant Organization Display
 * 
 * Component that displays current organization context with role-based information.
 * Always visible in admin interface to ensure users are aware of organizational context.
 */

import { Building2, ChevronDown, Shield, Users } from 'lucide-react'
import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CurrentOrganizationBadge } from '@/components/ui/organization-badge'
import { Skeleton } from '@/components/ui/skeleton'

// Types
interface Organization {
  id: string
  name: string
  slug: string
  plan?: string
  member_count?: number
}

interface User {
  id: string
  email: string
  full_name?: string
  role?: string
}

interface OrganizationHeaderProps {
  organization: Organization | null
  user: User | null
  isLoading?: boolean
  onSwitchOrganization?: () => void
  className?: string
}

// Role hierarchy mapping for display
const ROLE_CONFIG = {
  owner: {
    label: 'Owner',
    description: 'Full access to all features',
    variant: 'destructive' as const,
    icon: Shield,
  },
  admin: {
    label: 'Admin', 
    description: 'Manage members and settings',
    variant: 'default' as const,
    icon: Shield,
  },
  member: {
    label: 'Member',
    description: 'Access to core features',
    variant: 'secondary' as const,
    icon: Users,
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access',
    variant: 'outline' as const,
    icon: Users,
  },
} as const

type RoleKey = keyof typeof ROLE_CONFIG

// Helper function to get role configuration
function getRoleConfig(role?: string): typeof ROLE_CONFIG[RoleKey] {
  const roleKey = (role?.toLowerCase() ?? 'viewer') as RoleKey
  return ROLE_CONFIG[roleKey] ?? ROLE_CONFIG.viewer
}

// Helper function to format member count
function formatMemberCount(count?: number): string {
  if (typeof count !== 'number' || count === 0) {return '0 members'}
  if (count === 1) {return '1 member'}
  return `${count} members`
}

// Helper components for OrganizationHeader to reduce function complexity
function LoadingState({ className }: { className: string }): JSX.Element {
  return (
    <div className={`flex items-center justify-between p-4 bg-background border-b ${className}`}>
      <div className="flex items-center space-x-3">
        <Skeleton className="h-8 w-8 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  )
}

function NoOrganizationState({ className }: { className: string }): JSX.Element {
  return (
    <div className={`flex items-center justify-between p-4 bg-background border-b border-destructive ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded bg-destructive/10 flex items-center justify-center">
          <Building2 className="h-4 w-4 text-destructive" />
        </div>
        <div>
          <p className="font-medium text-destructive">No Organization</p>
          <p className="text-sm text-muted-foreground">Organization context not available</p>
        </div>
      </div>
      <Badge variant="destructive">Error</Badge>
    </div>
  )
}

function OrganizationInfo({ organization }: { organization: Organization }): JSX.Element {
  return (
    <div className="flex items-center space-x-3">
      <CurrentOrganizationBadge 
        orgName={organization.name}
        tier={(organization.plan as 'free' | 'pro' | 'enterprise') ?? 'free'}
        className="h-8 w-8"
      />
      <div className="min-w-0">
        <div className="flex items-center space-x-2">
          <h2 className="font-semibold text-lg truncate">
            {organization.name}
          </h2>
          {Boolean(organization.plan) && <Badge variant="outline" className="text-xs">
              {organization.plan}
            </Badge>}
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{formatMemberCount(organization.member_count)}</span>
          {Boolean(organization.slug) && <>
              <span>•</span>
              <span className="font-mono text-xs">/{organization.slug}</span>
            </>}
        </div>
      </div>
    </div>
  )
}

function UserRoleActions({ 
  user, 
  organization, 
  onSwitchOrganization 
}: { 
  user: User | null
  organization: Organization
  onSwitchOrganization?: () => void 
}): JSX.Element {
  const roleConfig = getRoleConfig(user?.role)
  const RoleIcon = roleConfig.icon

  return (
    <div className="flex items-center space-x-3">
      {Boolean(user?.role) && <Badge variant={roleConfig.variant} className="flex items-center space-x-1">
          <RoleIcon className="h-3 w-3" />
          <span>{roleConfig.label}</span>
        </Badge>}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <ChevronDown className="h-4 w-4" />
            <span className="sr-only">Organization actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Organization Context</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="px-2 py-1.5">
            <div className="text-sm font-medium">{organization.name}</div>
            <div className="text-xs text-muted-foreground">
              ID: {organization.id.slice(0, 8)}...
            </div>
          </div>

          <DropdownMenuSeparator />
          
          {Boolean(user?.role) && <div className="px-2 py-1.5">
              <div className="flex items-center space-x-2 text-sm">
                <RoleIcon className="h-3 w-3" />
                <span className="font-medium">{roleConfig.label}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {roleConfig.description}
              </div>
            </div>}

          <DropdownMenuSeparator />

          {Boolean(onSwitchOrganization) && <DropdownMenuItem onClick={onSwitchOrganization}>
              <Building2 className="mr-2 h-4 w-4" />
              Switch Organization
            </DropdownMenuItem>}
          
          <DropdownMenuItem asChild>
            <a href="/admin/settings">
              <Shield className="mr-2 h-4 w-4" />
              Organization Settings
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function OrganizationHeader({
  organization,
  user,
  isLoading = false,
  onSwitchOrganization,
  className = '',
}: OrganizationHeaderProps): JSX.Element {
  if (isLoading) {
    return <LoadingState className={className} />
  }

  if (!organization) {
    return <NoOrganizationState className={className} />
  }

  return (
    <div className={`flex items-center justify-between p-4 bg-background border-b ${className}`}>
      <OrganizationInfo organization={organization} />
      <UserRoleActions 
        user={user} 
        organization={organization} 
        onSwitchOrganization={onSwitchOrganization} 
      />
    </div>
  )
}

// Export additional components for specific use cases

/**
 * Compact Organization Header for smaller spaces
 */
export function CompactOrganizationHeader({
  organization,
  user,
  className = '',
}: Pick<OrganizationHeaderProps, 'organization' | 'user' | 'className'>): JSX.Element {
  if (!organization) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Badge variant="destructive" className="text-xs">
          No Org
        </Badge>
      </div>
    )
  }

  const roleConfig = getRoleConfig(user?.role)

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <CurrentOrganizationBadge 
        orgName={organization.name}
        tier={organization.plan as 'free' | 'pro' | 'enterprise' || 'free'}
        className="h-6 w-6"
      />
      <span className="text-sm font-medium truncate max-w-32">
        {organization.name}
      </span>
      {Boolean(user?.role) && <Badge variant={roleConfig.variant} className="text-xs">
          {roleConfig.label}
        </Badge>}
    </div>
  )
}

/**
 * Organization Header with custom actions
 */
export function OrganizationHeaderWithActions({
  organization,
  user,
  actions,
  className = '',
}: OrganizationHeaderProps & {
  actions?: React.ReactNode
}): JSX.Element {
  return (
    <div className={`flex items-center justify-between p-4 bg-background border-b ${className}`}>
      {/* Left: Organization Info */}
      <div className="flex items-center space-x-3">
        <CurrentOrganizationBadge 
          orgName={organization?.name ?? 'Unknown'}
          tier={(organization?.plan as 'free' | 'pro' | 'enterprise') ?? 'free'}
          className="h-8 w-8"
        />
        <div className="min-w-0">
          <h2 className="font-semibold text-lg truncate">
            {organization?.name ?? 'No Organization'}
          </h2>
          {Boolean(user?.role) && <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>as</span>
              <Badge variant={getRoleConfig(user?.role).variant} className="text-xs">
                {getRoleConfig(user?.role).label}
              </Badge>
            </div>}
        </div>
      </div>

      {/* Right: Custom Actions */}
      {Boolean(actions) && <div className="flex items-center space-x-2">
          {actions}
        </div>}
    </div>
  )
}

// Named export only - no default export