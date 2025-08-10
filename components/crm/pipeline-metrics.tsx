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
  filteredStages?: any
  currentFilters?: PipelineFiltersState
}

export function PipelineMetrics({
  startDate,
  endDate,
  className,
  filters,
  enableAdvanced = false,
  filteredStages: _filteredStages,
  currentFilters: _currentFilters,
}: PipelineMetricsProps): JSX.Element {
  const hasFilters = checkFiltersApplied(filters)
  const shouldUseAdvanced = enableAdvanced || hasFilters

  const basicMetricsQuery = useBasicMetrics({
    startDate,
    endDate,
    enabled: !shouldUseAdvanced,
  })

  const advancedMetricsQuery = useAdvancedMetrics({
    startDate,
    endDate,
    filters,
    enabled: shouldUseAdvanced,
  })

  const activeQuery = shouldUseAdvanced ? advancedMetricsQuery : basicMetricsQuery

  if (activeQuery.isLoading) {
    return <MetricsLoadingSkeleton className={className} />
  }

  if (activeQuery.error !== null) {
    return <ErrorDisplay error={activeQuery.error} />
  }

  return (
    <div className={className}>{renderMetricsContent(activeQuery.data, shouldUseAdvanced)}</div>
  )
}

// Helper functions to reduce complexity
function checkFiltersApplied(filters?: PipelineFiltersState): boolean {
  if (!filters) {
    return false
  }

  return (
    hasArrayItems(filters.stages) ||
    hasArrayItems(filters.sources) ||
    hasArrayItems(filters.assignedUsers) ||
    hasArrayItems(filters.tags) ||
    hasStringValue(filters.valueMin) ||
    hasStringValue(filters.valueMax)
  )
}

function hasArrayItems(arr?: string[]): boolean {
  return (arr?.length ?? 0) > 0
}

function hasStringValue(str?: string): boolean {
  return (str?.length ?? 0) > 0
}

function renderMetricsContent(data: unknown, isAdvanced: boolean): JSX.Element {
  if (data === null || data === undefined) {
    return <div>Nenhum dado disponível</div>
  }

  if (isAdvanced) {
    return <AdvancedMetricsDisplay data={data as any} />
  }

  return <BasicMetricsDisplay data={data as any} />
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
