/**
 * Hook para buscar organizações do usuário com switching
 * Usado no header para dropdown de organizações
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth'
import { organizationsService } from '@/services/organizations'
import type { Organization } from '@/types/organization'

export interface UserOrganization extends Organization {
  role: 'owner' | 'admin' | 'member'
  last_activity?: string
  member_count?: number
}

export interface UseUserOrganizationsReturn {
  organizations: UserOrganization[]
  isLoading: boolean
  error: string | null
  currentOrganization: UserOrganization | null
  switchOrganization: (orgId: string) => Promise<void>
  refreshOrganizations: () => Promise<void>
}

export function useUserOrganizations(): UseUserOrganizationsReturn {
  const { user, organization } = useAuthStore()
  const [organizations, setOrganizations] = useState<UserOrganization[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar organizações do usuário
  const fetchUserOrganizations = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      // Por enquanto, usar a organização atual como base
      // TODO: Implementar endpoint /api/users/organizations quando disponível
      if (organization) {
        const orgWithRole: UserOrganization = {
          ...organization,
          role: organization.owner_id === user.id ? 'owner' : 'member',
          last_activity: 'Agora',
          member_count: 0 // Será atualizado pelo useMemberCount
        }
        setOrganizations([orgWithRole])
      } else {
        setOrganizations([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar organizações')
      setOrganizations([])
    } finally {
      setIsLoading(false)
    }
  }, [user, organization])

  // Trocar organização
  const switchOrganization = useCallback(async (orgId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // TODO: Implementar switching real quando API estiver disponível
      // await organizationsService.switchOrganization(orgId)
      
      // Por enquanto, apenas log
      console.log('Switching to organization:', orgId)
      
      // Recarregar página para atualizar contexto
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao trocar organização')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Atualizar organizações
  const refreshOrganizations = useCallback(() => {
    return fetchUserOrganizations()
  }, [fetchUserOrganizations])

  // Caregar organizações na montagem
  useEffect(() => {
    fetchUserOrganizations()
  }, [fetchUserOrganizations])

  // Organização atual
  const currentOrganization = organizations.find(org => org.id === organization?.id) || null

  return {
    organizations,
    isLoading,
    error,
    currentOrganization,
    switchOrganization,
    refreshOrganizations,
  }
}