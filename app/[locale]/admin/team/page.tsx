'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/auth'

import { MembersList } from './components/MembersList'
import { RemoveMemberDialog } from './components/RemoveMemberDialog'
import { RoleChangeDialog } from './components/RoleChangeDialog'
import { TeamFilters } from './components/TeamFilters'
import { TeamPageHeader } from './components/TeamPageHeader'
import { TeamStatsCards } from './components/TeamStatsCards'
import { useTeamManagement } from './hooks/useTeamManagement'
import { TeamPageContentProps } from './types/TeamTypes'

function TeamPageContent({
  members,
  filteredMembers,
  canManageMembers,
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  user,
  handleChangeRoleClick,
  setMemberToRemove,
}: TeamPageContentProps) {
  return (
    <>
      {/* Stats Cards */}
      <div className="w-full space-y-4">
        <TeamStatsCards members={members} />
      </div>

      {/* Filters */}
      <div className="w-full space-y-4">
        <TeamFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
        />
      </div>

      {/* Members List */}
      <div className="w-full space-y-4">
        <MembersList
          members={filteredMembers}
          totalMembers={members.length}
          currentUserId={user?.id}
          canManageMembers={canManageMembers}
          searchQuery={searchQuery}
          roleFilter={roleFilter}
          onChangeRole={handleChangeRoleClick}
          onRemoveMember={setMemberToRemove}
        />
      </div>
    </>
  )
}

export default function TeamPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()

  const {
    members,
    isLoading,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    memberToRemove,
    setMemberToRemove,
    memberToChangeRole,
    setMemberToChangeRole,
    newRole,
    isUpdatingRole,
    isRemovingMember,
    canManageMembers,
    filteredMembers,
    handleRoleChange,
    handleRemoveMember,
    handleChangeRoleClick,
  } = useTeamManagement({ user, toast })

  const handleNavigateToInvites = () => {
    router.push('/admin/team/invites')
  }

  const handleRoleChangeCancel = () => {
    setMemberToChangeRole(null)
  }

  const handleRemoveMemberCancel = () => {
    setMemberToRemove(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="w-full h-full space-y-6">
      <TeamPageHeader onNavigateToInvites={handleNavigateToInvites} />

      <TeamPageContent
        members={members}
        filteredMembers={filteredMembers}
        canManageMembers={canManageMembers}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        user={user}
        handleChangeRoleClick={handleChangeRoleClick}
        setMemberToRemove={setMemberToRemove}
      />

      <RoleChangeDialog
        member={memberToChangeRole}
        newRole={newRole}
        isUpdating={isUpdatingRole}
        onConfirm={handleRoleChange}
        onCancel={handleRoleChangeCancel}
      />

      <RemoveMemberDialog
        member={memberToRemove}
        isRemoving={isRemovingMember}
        onConfirm={handleRemoveMember}
        onCancel={handleRemoveMemberCancel}
      />
    </div>
  )
}
