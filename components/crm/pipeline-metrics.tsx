'use client'

import { useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { crmLeadsService } from '@/services/crm-leads'

import {
  MetricsCards,
  StageDistributionChart,
  AverageStageTimeChart,
  PipelineDistributionChart,
} from './pipeline-metrics-components'
import {
  MetricsLoadingSkeleton,
  createStageChartData,
  createStageTimeData,
} from './pipeline-metrics-utils'

interface PipelineMetricsProps {
  startDate?: string
  endDate?: string
  className?: string
}

interface MetricsResponse {
  stage_counts: Record<string, number>
  average_stage_times: Record<string, number>
  conversion_rate: number
  total_pipeline_value: number
  closed_pipeline_value: number
  total_leads: number
}

export function PipelineMetrics({
  startDate,
  endDate,
  className,
}: PipelineMetricsProps): JSX.Element {
  const {
    data: metrics,
    isLoading,
    error,
  } = useQuery<MetricsResponse>({
    queryKey: ['pipeline-metrics', startDate, endDate],
    queryFn: () => crmLeadsService.getPipelineMetrics({ startDate, endDate }),
    refetchInterval: 60_000, // Refresh every minute
  })

  if (isLoading) {
    return <MetricsLoadingSkeleton className={className} />
  }

  if (error) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="flex items-center gap-2 p-6">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-600">Erro ao carregar métricas do pipeline</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!metrics) {
    return <div className={className} />
  }

  const stageChartData = createStageChartData(metrics.stage_counts)
  const stageTimeData = createStageTimeData(metrics.average_stage_times)

  const conversionRate = metrics.conversion_rate ?? 0
  const pipelineValue = metrics.total_pipeline_value ?? 0
  const closedValue = metrics.closed_pipeline_value ?? 0

  return (
    <div className={className}>
      <div className="grid gap-6">
        {/* Key Metrics Cards */}
        <MetricsCards
          totalLeads={metrics.total_leads ?? 0}
          conversionRate={conversionRate}
          pipelineValue={pipelineValue}
          closedValue={closedValue}
        />

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <StageDistributionChart data={stageChartData} />
          <AverageStageTimeChart data={stageTimeData} />
        </div>

        {/* Pipeline Distribution Chart */}
        <PipelineDistributionChart data={stageChartData} />
      </div>
    </div>
  )
}
