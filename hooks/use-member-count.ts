/**
 * Hook para buscar contagem de membros da organização
 * Usado no header para exibir número de membros
 */

import { useState, useEffect, useCallback } from 'react'
import { useOrgContext } from '@/hooks/use-org-context'
import { membersService } from '@/services/members'

export interface UseMemberCountReturn {
  memberCount: number
  isLoading: boolean
  error: string | null
  refreshMemberCount: () => Promise<void>
}

export function useMemberCount(): UseMemberCountReturn {
  const { organization } = useOrgContext()
  const [memberCount, setMemberCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar contagem de membros
  const fetchMemberCount = useCallback(async () => {
    if (!organization) {
      setMemberCount(0)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const stats = await membersService.getMemberStats()
      setMemberCount(stats.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar contagem de membros')
      setMemberCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [organization])

  // Atualizar contagem de membros
  const refreshMemberCount = useCallback(() => {
    return fetchMemberCount()
  }, [fetchMemberCount])

  // Carregar contagem na montagem
  useEffect(() => {
    fetchMemberCount()
  }, [fetchMemberCount])

  return {
    memberCount,
    isLoading,
    error,
    refreshMemberCount,
  }
}
