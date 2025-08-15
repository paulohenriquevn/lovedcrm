import { Shield, TrendingUp, Users } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import type { AuditStatistics } from '../types'

interface StatisticsCardsProps {
  statistics: AuditStatistics | null
  isLoading: boolean
}

export function StatisticsCards({ statistics, isLoading }: StatisticsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={`skeleton-${i}`} className="h-24" />
        ))}
      </div>
    )
  }

  if (!statistics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={`skeleton-${i}`} className="h-24" />
        ))}
      </div>
    )
  }

  const [topAction] = Object.entries(statistics.actionsDistribution).sort(([, a], [, b]) => b - a)

  const [topTable] = Object.entries(statistics.tablesDistribution).sort(([, a], [, b]) => b - a)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Audit Logs</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.totalAuditLogs.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Active Action</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topAction?.[0] ?? 'N/A'}</div>
          <p className="text-xs text-muted-foreground">{topAction?.[1] ?? 0} occurrences</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Active Table</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topTable?.[0] ?? 'N/A'}</div>
          <p className="text-xs text-muted-foreground">{topTable?.[1] ?? 0} modifications</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top User Activity</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {statistics.mostActiveUsers[0]?.actionCount ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {statistics.mostActiveUsers[0]?.userName ?? 'No data'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
