'use client'

import { useCallback, useEffect } from 'react'

import { DashboardView } from '@/components/admin/DashboardView'
import { ErrorMessage } from '@/components/common/error-message'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { logger } from '@/lib/logger'
import { dashboardService } from '@/services/admin'
import { useDashboardStore } from '@/stores/admin'

import type { AdminStats, AdminActivity } from '@/types/admin'

export function DashboardContainer(): JSX.Element {
  /**
   * Container para o Dashboard.
   * Gerencia estado e lógica, delegando apresentação para DashboardView.
   */
  const dashboardStore = useDashboardStore()

  const loadDashboardData = useCallback(async () => {
    try {
      dashboardStore.setLoading(true)
      dashboardStore.setError(null)

      // Carregar dados em paralelo
      const [statsData, activitiesData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivities(),
      ])

      dashboardStore.setStats(statsData)
      dashboardStore.setRecentActivities(activitiesData)
    } catch (error_) {
      dashboardStore.setError('Falha ao carregar dados do dashboard')
      logger.apiError('Dashboard error', error_)
    } finally {
      dashboardStore.setLoading(false)
    }
  }, [dashboardStore])

  const handleRefresh = useCallback(() => {
    void loadDashboardData()
  }, [loadDashboardData])

  useEffect(() => {
    void loadDashboardData()
  }, [loadDashboardData])

  return (
    <DashboardContent
      stats={dashboardStore.stats}
      recentActivities={dashboardStore.recentActivities}
      isLoading={dashboardStore.isLoading}
      error={dashboardStore.error}
      onRefresh={handleRefresh}
    />
  )
}

interface DashboardContentProps {
  stats: AdminStats | null
  recentActivities: AdminActivity[]
  isLoading: boolean
  error: string | null
  onRefresh: () => void
}

function DashboardContent({
  stats,
  recentActivities,
  isLoading,
  error,
  onRefresh,
}: DashboardContentProps): JSX.Element {
  // Estados de loading e erro
  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error !== null && error !== undefined && error !== '') {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <ErrorMessage message={error ?? 'Erro desconhecido'} onRetry={onRefresh} />
      </div>
    )
  }

  // Renderizar view com dados
  return (
    <DashboardView
      stats={stats}
      metrics={null}
      activities={recentActivities}
      isLoading={false}
      error={null}
    />
  )
}
