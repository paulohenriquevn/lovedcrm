/**
 * Team actions hook - handles member role changes and removal
 */

import { useState } from 'react'

import { membersService } from '@/services/members'
import { OrganizationRole, type OrganizationMember } from '@/types/organization'

import { formatRoleDisplay } from '../utils/roleUtils'

interface UseTeamActionsProps {
  toast: {
    (props: { title: string; description?: string; variant?: 'default' | 'destructive' }): void
  }
  setMembers: React.Dispatch<React.SetStateAction<OrganizationMember[]>>
}

const ERROR_MESSAGE = 'Erro desconhecido'

// Update member role in local state
function updateMemberRoleInState(
  setMembers: React.Dispatch<React.SetStateAction<OrganizationMember[]>>,
  userId: string,
  newRole: OrganizationRole
): void {
  setMembers(prev =>
    prev.map(member => (member.user_id === userId ? { ...member, role: newRole } : member))
  )
}

// Remove member from local state
function removeMemberFromState(
  setMembers: React.Dispatch<React.SetStateAction<OrganizationMember[]>>,
  userId: string
): void {
  setMembers(prev => prev.filter(member => member.user_id !== userId))
}

// Get member display name
function getMemberDisplayName(member: OrganizationMember): string {
  return member.user?.full_name ?? member.user?.email ?? 'Usuário'
}

// Handle role change API call
async function updateMemberRoleLocal({
  member,
  newRole,
  setMembers,
  toast,
}: {
  member: OrganizationMember
  newRole: OrganizationRole
  setMembers: React.Dispatch<React.SetStateAction<OrganizationMember[]>>
  toast: UseTeamActionsProps['toast']
}): Promise<void> {
  await membersService.updateMemberRole(member.user_id, { role: newRole })

  updateMemberRoleInState(setMembers, member.user_id, newRole)

  toast({
    title: 'Role atualizado',
    description: `${getMemberDisplayName(member)} agora é ${formatRoleDisplay(newRole)}`,
  })
}

// Handle member removal API call
async function removeMemberFromTeam(
  member: OrganizationMember,
  setMembers: React.Dispatch<React.SetStateAction<OrganizationMember[]>>,
  toast: UseTeamActionsProps['toast']
): Promise<void> {
  await membersService.removeMember(member.user_id)

  removeMemberFromState(setMembers, member.user_id)

  toast({
    title: 'Membro removido',
    description: `${getMemberDisplayName(member)} foi removido da equipe`,
  })
}

export const useTeamActions = ({ toast, setMembers }: UseTeamActionsProps) => {
  // Modal states
  const [memberToRemove, setMemberToRemove] = useState<OrganizationMember | null>(null)
  const [memberToChangeRole, setMemberToChangeRole] = useState<OrganizationMember | null>(null)
  const [newRole, setNewRole] = useState<OrganizationRole.ADMIN | OrganizationRole.MEMBER>(
    OrganizationRole.MEMBER
  )

  // Loading states
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)
  const [isRemovingMember, setIsRemovingMember] = useState(false)

  const handleRoleChange = (): void => {
    if (memberToChangeRole === null) {
      return
    }

    const executeRoleUpdate = async (): Promise<void> => {
      try {
        setIsUpdatingRole(true)
        await updateMemberRoleLocal({ member: memberToChangeRole, newRole, setMembers, toast })
        setMemberToChangeRole(null)
      } catch (error) {
        toast({
          title: 'Erro ao atualizar role',
          description: error instanceof Error ? error.message : ERROR_MESSAGE,
          variant: 'destructive',
        })
      } finally {
        setIsUpdatingRole(false)
      }
    }

    void executeRoleUpdate()
  }

  const handleRemoveMember = (): void => {
    if (memberToRemove === null) {
      return
    }

    const executeMemberRemoval = async (): Promise<void> => {
      try {
        setIsRemovingMember(true)
        await removeMemberFromTeam(memberToRemove, setMembers, toast)
        setMemberToRemove(null)
      } catch (error) {
        toast({
          title: 'Erro ao remover membro',
          description: error instanceof Error ? error.message : ERROR_MESSAGE,
          variant: 'destructive',
        })
      } finally {
        setIsRemovingMember(false)
      }
    }

    void executeMemberRemoval()
  }

  const handleChangeRoleClick = (member: OrganizationMember): void => {
    setMemberToChangeRole(member)
    setNewRole(
      member.role === OrganizationRole.ADMIN ? OrganizationRole.MEMBER : OrganizationRole.ADMIN
    )
  }

  return {
    // State
    memberToRemove,
    setMemberToRemove,
    memberToChangeRole,
    setMemberToChangeRole,
    newRole,
    isUpdatingRole,
    isRemovingMember,
    // Functions
    handleRoleChange,
    handleRemoveMember,
    handleChangeRoleClick,
  }
}
