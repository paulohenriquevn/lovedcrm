/**
 * Header Utils - Utility functions for header component
 * Extracted to reduce header.tsx complexity
 */

const BG_GRAY_100_TEXT_GRAY_600 = 'bg-gray-100 text-gray-600'

export function getRoleBadgeStyle(role: string): string {
  switch (role?.toLowerCase()) {
    case 'owner': {
      return 'bg-purple-100 text-purple-700 border-purple-200'
    }
    case 'admin': {
      return 'bg-blue-100 text-blue-700 border-blue-200'
    }
    case 'member': {
      return BG_GRAY_100_TEXT_GRAY_600
    }
    default: {
      return BG_GRAY_100_TEXT_GRAY_600
    }
  }
}

export function getTierBadgeStyle(tier: string): string {
  switch (tier?.toLowerCase()) {
    case 'pro': {
      return 'bg-violet-100 text-violet-700 border-violet-200'
    }
    case 'enterprise': {
      return 'bg-gray-900 text-gray-100 border-gray-800'
    }
    case 'free': {
      return BG_GRAY_100_TEXT_GRAY_600
    }
    default: {
      return BG_GRAY_100_TEXT_GRAY_600
    }
  }
}

export function getDisplayName(user: { fullName?: string; email?: string } | null): string {
  if (!user) {
    return 'Usuário'
  }
  return user.fullName ?? user.email?.split('@')[0] ?? 'Usuário'
}

export function getUserInitials(user: { fullName?: string; email?: string } | null): string {
  if (!user) {
    return 'U'
  }
  
  if (Boolean(user.fullName) && user.fullName.length > 0) {
    return user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)
  }
  
  return (Boolean(user.email) && user.email.length > 0) ? user.email[0].toUpperCase() : 'U'
}

export function formatMemberCount(count: number, isLoading: boolean): string {
  if (isLoading) {
    return '...'
  }
  return count.toString()
}

export function formatOrgName(orgName: string | null | undefined): string {
  return orgName ?? 'Selecionar organização'
}

export interface SafeOrganization {
  id: string
  name: string
  ownerId: string
  createdAt: string
  updatedAt: string
  tier: string
}

// Input organization type for type safety
interface OrganizationInput {
  id?: string | null
  name?: string | null
  ownerId?: string | null
  owner_id?: string | null
  createdAt?: string | null
  created_at?: string | null
  updatedAt?: string | null
  updated_at?: string | null
  tier?: string | null
}

const DEFAULT_ORG: SafeOrganization = {
  id: '',
  name: 'Selecione organização',
  ownerId: '',
  createdAt: '',
  updatedAt: '',
  tier: 'free'
}

// Helper functions to get field values with fallbacks
const getId = (org: OrganizationInput): string => org.id ?? ''
const getName = (org: OrganizationInput): string => org.name ?? 'Selecione organização' 
const getOwnerId = (org: OrganizationInput): string => org.ownerId ?? org.owner_id ?? ''
const getCreatedAt = (org: OrganizationInput): string => org.createdAt ?? org.created_at ?? ''
const getUpdatedAt = (org: OrganizationInput): string => org.updatedAt ?? org.updated_at ?? ''
const getTier = (org: OrganizationInput): string => org.tier ?? 'free'

// Helper function to normalize organization input
const normalizeOrgInput = (org: OrganizationInput): SafeOrganization => ({
  id: getId(org),
  name: getName(org),
  ownerId: getOwnerId(org),
  createdAt: getCreatedAt(org),
  updatedAt: getUpdatedAt(org),
  tier: getTier(org)
})

export function createSafeOrganization(org: OrganizationInput | null | undefined): SafeOrganization {
  return org ? normalizeOrgInput(org) : DEFAULT_ORG
}

export function handleThemeToggle(theme: string | undefined, setTheme: (theme: string) => void): void {
  setTheme(theme === 'dark' ? 'light' : 'dark')
}

export function handleOrgSwitch(orgId: string, switchFn: (id: string) => Promise<void>): void {
  void switchFn(orgId)
}

export function handleLogout(logoutFn: () => Promise<void>): void {
  void logoutFn()
}