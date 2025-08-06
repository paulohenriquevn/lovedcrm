'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { membersService } from '@/services/members'
import { organizationsService } from '@/services/organizations'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationsStore } from '@/stores/organizations'
import {
  OrganizationRole,
  type OrganizationMemberCreate,
  type Organization,
  type OrganizationMember,
} from '@/types/organization'

interface OrganizationUpdateData {
  name?: string
  description?: string
  slug?: string
}

export function useOrganizationHandlers(organizationId: string) {
  const router = useRouter()
  const { user } = useAuthStore()
  const store = useOrganizationsStore()

  const basicHandlers = useBasicOrganizationHandlers(
    organizationId,
    store as OrganizationStoreHandlers
  )
  const memberHandlers = useMemberHandlers(organizationId, store as MemberStoreHandlers)
  const navigationHandlers = useNavigationHandlers({
    router,
    user,
    setError: store.setError,
  })

  return {
    ...basicHandlers,
    ...memberHandlers,
    ...navigationHandlers,
  }
}

interface OrganizationStoreHandlers {
  updateOrganization: (id: string, data: Partial<Organization>) => void
  addMember: (member: OrganizationMember) => void
  setError: (error: string | null) => void
}

function useBasicOrganizationHandlers(organizationId: string, store: OrganizationStoreHandlers) {
  const { updateOrganization, addMember, setError } = store

  const handleUpdateOrganization = useCallback(
    async (data: OrganizationUpdateData) => {
      try {
        const updatedOrganization = await organizationsService.updateCurrentOrganization(data)
        updateOrganization(organizationId, updatedOrganization as Partial<Organization>)
        // toast({ title: "Sucesso", description: 'Organização atualizada com sucesso' })
      } catch (error_) {
        const message = error_ instanceof Error ? error_.message : 'Erro ao atualizar organização'
        setError(message)
        // toast({ title: "Erro", description: message, variant: "destructive" })
      }
    },
    [organizationId, updateOrganization, setError]
  )

  const handleAddMember = useCallback(
    async (data: OrganizationMemberCreate) => {
      try {
        const result = await membersService.inviteMember(data)
        // Since inviteMember returns invite info, we need to create a mock member object
        // Database/API model with snake_case properties - ESLint camelcase disabled
        /* eslint-disable camelcase */
        const newMember: OrganizationMember = {
          id: result.invite_id,
          user_id: '',
          organization_id: organizationId,
          role: data.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: false, // Pending invite
          user: {
            id: '',
            email: data.email,
            full_name: data.email,
            avatar_url: null,
            is_active: false,
            created_at: new Date().toISOString(),
            last_login: null,
          },
        }
        /* eslint-enable camelcase */
        addMember(newMember)
        // toast({ title: "Sucesso", description: 'Membro adicionado com sucesso' })
      } catch (error_) {
        const message = error_ instanceof Error ? error_.message : 'Erro ao adicionar membro'
        setError(message)
        // toast({ title: "Erro", description: message, variant: "destructive" })
      }
    },
    [organizationId, addMember, setError]
  )

  return { handleUpdateOrganization, handleAddMember }
}

interface MemberStoreHandlers {
  updateMember: (id: string, updates: Partial<OrganizationMember>) => void
  removeMember: (id: string) => void
  setError: (error: string | null) => void
}

function useMemberHandlers(organizationId: string, store: MemberStoreHandlers) {
  const { updateMember, removeMember, setError } = store

  const handleUpdateMemberRole = useCallback(
    async (memberId: string, newRole: string) => {
      try {
        await membersService.updateMemberRole(memberId, { role: newRole as OrganizationRole })
        updateMember(memberId, { role: newRole as OrganizationRole })
        // toast({ title: "Sucesso", description: 'Permissão atualizada com sucesso' })
      } catch (error_) {
        const message = error_ instanceof Error ? error_.message : 'Erro ao atualizar permissão'
        setError(message)
        // toast({ title: "Erro", description: message, variant: "destructive" })
      }
    },
    [updateMember, setError]
  )

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      try {
        await membersService.removeMember(memberId)
        removeMember(memberId)
        // toast({ title: "Sucesso", description: 'Membro removido com sucesso' })
      } catch (error_) {
        const message = error_ instanceof Error ? error_.message : 'Erro ao remover membro'
        setError(message)
        // toast({ title: "Erro", description: message, variant: "destructive" })
      }
    },
    [removeMember, setError]
  )

  return { handleUpdateMemberRole, handleRemoveMember }
}

interface NavigationHandlersProps {
  router: ReturnType<typeof useRouter>
  user: { id: string } | null
  setError: (error: string | null) => void
}

function useNavigationHandlers(props: NavigationHandlersProps) {
  const { router, user, setError } = props

  const handleLeaveOrganization = useCallback(async () => {
    if (user?.id === undefined || user.id === null || user.id === '') {
      return
    }

    try {
      await membersService.removeMember(user.id)
      // toast({ title: "Sucesso", description: 'Você saiu da organização' })
      router.push('/admin')
    } catch (error_) {
      const message = error_ instanceof Error ? error_.message : 'Erro ao sair da organização'
      setError(message)
      // toast({ title: "Erro", description: message, variant: "destructive" })
    }
  }, [user, router, setError])

  const handleDeleteOrganization = useCallback(async () => {
    try {
      await organizationsService.deleteCurrentOrganization()
      // toast({ title: "Sucesso", description: 'Organização excluída com sucesso' })
      router.push('/admin')
    } catch (error_) {
      const message = error_ instanceof Error ? error_.message : 'Erro ao excluir organização'
      setError(message)
      // toast({ title: "Erro", description: message, variant: "destructive" })
    }
  }, [router, setError])

  return { handleLeaveOrganization, handleDeleteOrganization }
}
