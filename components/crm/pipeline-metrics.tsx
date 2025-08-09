'use client'

import { AdvancedMetricsDisplay } from './pipeline-advanced-metrics'
import { BasicMetricsDisplay } from './pipeline-basic-metrics'
import {
  useBasicMetrics,
  useAdvancedMetrics,
  type PipelineFiltersState,
} from './pipeline-metrics-hooks'
import { MetricsLoadingSkeleton } from './pipeline-metrics-utils'

interface PipelineMetricsProps {
  startDate?: string
  endDate?: string
  className?: string
  filters?: PipelineFiltersState
  enableAdvanced?: boolean
}

export function PipelineMetrics({
  startDate,
  endDate,
  className,
  filters,
  enableAdvanced = false,
}: PipelineMetricsProps): JSX.Element {
  const basicMetricsQuery = useBasicMetrics({
    startDate,
    endDate,
    enabled: !enableAdvanced,
  })

  const advancedMetricsQuery = useAdvancedMetrics({
    startDate,
    endDate,
    filters,
    enabled: enableAdvanced,
  })

  const isLoading = enableAdvanced ? advancedMetricsQuery.isLoading : basicMetricsQuery.isLoading
  const error = enableAdvanced ? advancedMetricsQuery.error : basicMetricsQuery.error

  if (isLoading) {
    return <MetricsLoadingSkeleton className={className} />
  }

  if (error) {
    return <ErrorDisplay error={error} />
  }

  if (enableAdvanced && advancedMetricsQuery.data) {
    return (
      <div className={className}>
        <AdvancedMetricsDisplay data={advancedMetricsQuery.data} />
      </div>
    )
  }

  if (basicMetricsQuery.data) {
    return (
      <div className={className}>
        <BasicMetricsDisplay data={basicMetricsQuery.data} />
      </div>
    )
  }

  return <div className={className}>Nenhum dado disponível</div>
}

interface ErrorDisplayProps {
  error: Error | null
}

function ErrorDisplay({ error }: ErrorDisplayProps): JSX.Element {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Erro ao carregar métricas: {error?.message ?? 'Erro desconhecido'}
        </p>
      </div>
    </div>
  )
}

export { type PipelineFiltersState } from './pipeline-metrics-hooks'
