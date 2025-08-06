/**
 * View do Dashboard - componente puro de apresentação.
 */

import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { StatsCards, RecentActivities } from './DashboardComponents'
import { DashboardStats, Activity } from '../../types/admin'

interface DashboardViewProps {
  stats: DashboardStats | null
  recentActivities: Activity[]
  onRefresh: () => void
}

// Dashboard header component
function DashboardHeader({ onRefresh }: { onRefresh: () => void }): JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral dos seus dados</p>
      </div>
      <Button onClick={onRefresh} variant="outline" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Atualizar
      </Button>
    </div>
  )
}

export function DashboardView({
  stats,
  recentActivities,
  onRefresh,
}: DashboardViewProps): JSX.Element {
  /**
   * Componente puro de apresentação do dashboard.
   * Não contém lógica de negócio, apenas renderização.
   */

  return (
    <div className="space-y-6">
      <DashboardHeader onRefresh={onRefresh} />
      <StatsCards stats={stats} />
      <RecentActivities activities={recentActivities} onRefresh={onRefresh} />
    </div>
  )
}
