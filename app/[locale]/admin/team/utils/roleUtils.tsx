/**
 * Role-related utilities for team management
 */

import { Crown, Shield, User } from 'lucide-react'
import React from 'react'

import { OrganizationRole } from '@/types/organization'

export const roleIcons = {
  [OrganizationRole.OWNER]: Crown,
  [OrganizationRole.ADMIN]: Shield,
  [OrganizationRole.MEMBER]: User,
}

export const roleBadgeVariants = {
  [OrganizationRole.OWNER]: 'default' as const,
  [OrganizationRole.ADMIN]: 'secondary' as const,
  [OrganizationRole.MEMBER]: 'outline' as const,
} as const

export const roleColors = {
  [OrganizationRole.OWNER]: 'text-primary',
  [OrganizationRole.ADMIN]: 'text-secondary-foreground',
  [OrganizationRole.MEMBER]: 'text-muted-foreground',
}

/**
 * Ensures role compatibility (handles both enum and string)
 */
export const normalizeRole = (role: string | OrganizationRole): OrganizationRole => {
  if (typeof role === 'string') {
    switch (role.toLowerCase()) {
      case 'owner': {
        return OrganizationRole.OWNER
      }
      case 'admin': {
        return OrganizationRole.ADMIN
      }
      case 'member': {
        return OrganizationRole.MEMBER
      }
      default: {
        return OrganizationRole.MEMBER
      }
    }
  }
  return role
}

/**
 * Gets role icon with styling using design tokens
 */
export const getRoleIcon = (role: OrganizationRole | string): React.ReactNode => {
  const normalizedRole = normalizeRole(role)
  const Icon = roleIcons[normalizedRole] ?? User
  return <Icon className={`h-4 w-4 ${roleColors[normalizedRole]}`} />
}

/**
 * Formats role display name
 */
export const formatRoleDisplay = (role: OrganizationRole | string): string => {
  const normalizedRole = normalizeRole(role)
  switch (normalizedRole) {
    case OrganizationRole.OWNER: {
      return 'Owner'
    }
    case OrganizationRole.ADMIN: {
      return 'Admin'
    }
    case OrganizationRole.MEMBER: {
      return 'Member'
    }
    default: {
      return 'Member'
    }
  }
}

/**
 * Determines if a member can be managed by current user
 */
export const canManageThisMember = (
  member: { role: OrganizationRole | string; user_id: string },
  canManageMembers: boolean,
  currentUserId?: string
): boolean => {
  return Boolean(
    canManageMembers &&
      normalizeRole(member.role) !== OrganizationRole.OWNER &&
      member.user_id !== currentUserId
  )
}
