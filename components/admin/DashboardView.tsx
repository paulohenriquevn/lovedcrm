/**
 * Admin Dashboard View Component
 */

'use client'

import { useTranslations } from 'next-intl'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { AdminStats, SystemMetrics, AdminActivity } from '@/types/admin'

// Common translation key
const DASHBOARD_TRANSLATION_KEY = 'admin.dashboard'

interface DashboardViewProps {
  stats: AdminStats | null
  metrics: SystemMetrics | null
  activities: AdminActivity[]
  isLoading: boolean
  error: string | null
}

interface StatsCardsProps {
  stats: AdminStats
}

interface SystemMetricsProps {
  metrics: SystemMetrics
}

interface ActivitiesListProps {
  activities: AdminActivity[]
}

export function StatsCards({ stats }: StatsCardsProps): JSX.Element {
  const tDashboard = useTranslations('admin.dashboard.stats')

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {tDashboard('totalUsers')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {tDashboard('organizations')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {tDashboard('activeUsers')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {tDashboard('newRegistrations')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.newSignups}</div>
        </CardContent>
      </Card>
    </div>
  )
}

export function SystemMetrics({ metrics }: SystemMetricsProps): JSX.Element {
  const tDashboard = useTranslations(DASHBOARD_TRANSLATION_KEY)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tDashboard('systemMetrics.title')}</CardTitle>
        <CardDescription>{tDashboard('systemMetrics.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold">{metrics.cpuUsage}%</div>
            <div className="text-xs text-gray-500">{tDashboard('systemMetrics.cpu')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{metrics.memoryUsage}%</div>
            <div className="text-xs text-gray-500">{tDashboard('systemMetrics.memory')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{metrics.diskUsage}%</div>
            <div className="text-xs text-gray-500">{tDashboard('systemMetrics.disk')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{Math.floor(metrics.uptime / 3600)}h</div>
            <div className="text-xs text-gray-500">{tDashboard('systemMetrics.uptime')}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ActivitiesList({ activities }: ActivitiesListProps): JSX.Element {
  const tDashboard = useTranslations(DASHBOARD_TRANSLATION_KEY)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tDashboard('recentActivity.title')}</CardTitle>
        <CardDescription>{tDashboard('recentActivity.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activities.slice(0, 10).map(activity => (
            <div
              key={activity.id}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.resource}</p>
              </div>
              <div className="text-xs text-gray-400">
                {new Date(activity.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardView({
  stats,
  metrics,
  activities,
  isLoading,
  error,
}: DashboardViewProps): JSX.Element {
  const tDashboard = useTranslations(DASHBOARD_TRANSLATION_KEY)
  // Remove unused tCommon variable

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2" />
          <p className="text-sm text-gray-600">{tDashboard('loading')}</p>
        </div>
      </div>
    )
  }

  if (error !== null && error !== '') {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="font-medium">{tDashboard('loadError')}</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {stats !== null && <StatsCards stats={stats} />}
      {metrics !== null && <SystemMetrics metrics={metrics} />}
      {activities.length > 0 && <ActivitiesList activities={activities} />}
    </div>
  )
}
