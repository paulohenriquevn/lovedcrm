import { useCallback, useEffect, useState } from 'react'

import { invitesService } from '@/services/invites'

import type { OrganizationInvite, OrganizationInviteStats } from '@/types/organization'

interface UseInvitesListOptions {
  canManageInvites: boolean
}

interface UseInvitesListReturn {
  invites: OrganizationInvite[]
  stats: OrganizationInviteStats | null
  loading: boolean
  error: string | null
  statusFilter: string
  setStatusFilter: (filter: string) => void
  refreshInvites: () => Promise<void>
}

interface LoadInvitesResult {
  invites: OrganizationInvite[]
  stats: OrganizationInviteStats
}

async function loadInvitesData(statusFilter: string): Promise<LoadInvitesResult> {
  const [invitesData, statsData] = await Promise.all([
    invitesService.listInvites(statusFilter === 'all' ? undefined : statusFilter),
    invitesService.getInviteStats(),
  ])

  return {
    invites: invitesData,
    stats: statsData,
  }
}

export function useInvitesList({ canManageInvites }: UseInvitesListOptions): UseInvitesListReturn {
  const [invites, setInvites] = useState<OrganizationInvite[]>([])
  const [stats, setStats] = useState<OrganizationInviteStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const refreshInvites = useCallback(async (): Promise<void> => {
    if (!canManageInvites) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { invites: invitesData, stats: statsData } = await loadInvitesData(statusFilter)

      setInvites(invitesData)
      setStats(statsData)
    } catch (error_) {
      const errorMessage = error_ instanceof Error ? error_.message : 'Erro ao carregar convites'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [canManageInvites, statusFilter])

  useEffect(() => {
    if (canManageInvites) {
      void refreshInvites()
    }
  }, [refreshInvites, canManageInvites])

  return {
    invites,
    stats,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    refreshInvites,
  }
}
