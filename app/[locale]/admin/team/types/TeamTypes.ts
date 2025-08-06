/**
 * TypeScript interfaces for team management components
 */

import { OrganizationMember, OrganizationRole } from '@/types/organization'

export interface TeamFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  roleFilter: string
  onRoleFilterChange: (value: string) => void
}

export interface TeamStatsCardsProps {
  members: OrganizationMember[]
}

export interface MemberAvatarProps {
  member: OrganizationMember
}

export interface MemberInfoProps {
  member: OrganizationMember
  currentUserId?: string
}

export interface MemberRoleBadgeProps {
  member: OrganizationMember
}

export interface MemberActionsProps {
  member: OrganizationMember
  canManageMembers: boolean
  currentUserId?: string
  onChangeRole: (member: OrganizationMember) => void
  onRemoveMember: (member: OrganizationMember) => void
}

export interface MemberCardProps {
  member: OrganizationMember
  currentUserId?: string
  canManageMembers: boolean
  onChangeRole: (member: OrganizationMember) => void
  onRemoveMember: (member: OrganizationMember) => void
}

export interface MembersListProps {
  members: OrganizationMember[]
  totalMembers: number
  currentUserId?: string
  canManageMembers: boolean
  searchQuery: string
  roleFilter: string
  onChangeRole: (member: OrganizationMember) => void
  onRemoveMember: (member: OrganizationMember) => void
}

export interface RoleChangeDialogProps {
  member: OrganizationMember | null
  newRole: OrganizationRole.ADMIN | OrganizationRole.MEMBER
  isUpdating: boolean
  onConfirm: () => void
  onCancel: () => void
}

export interface RemoveMemberDialogProps {
  member: OrganizationMember | null
  isRemoving: boolean
  onConfirm: () => void
  onCancel: () => void
}

export interface TeamPageContentProps {
  members: OrganizationMember[]
  filteredMembers: OrganizationMember[]
  canManageMembers: boolean
  searchQuery: string
  setSearchQuery: (value: string) => void
  roleFilter: string
  setRoleFilter: (value: string) => void
  user: { id?: string } | null
  handleChangeRoleClick: (member: OrganizationMember) => void
  setMemberToRemove: (member: OrganizationMember) => void
}
