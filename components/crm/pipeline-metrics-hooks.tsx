'use client'

import { useQuery } from '@tanstack/react-query'

import { crmLeadsService, type AdvancedMetricsResponse } from '@/services/crm-leads'

import type { PipelineFiltersState } from './pipeline-filters-types'

export type { PipelineFiltersState } from './pipeline-filters-types'

interface MetricsResponse {
  stage_counts: Record<string, number>
  average_stage_times: Record<string, number>
  conversion_rate: number
  total_pipeline_value: number
  closed_pipeline_value: number
  total_leads: number
}

interface UseBasicMetricsOptions {
  startDate?: string
  endDate?: string
  enabled?: boolean
}

interface UseAdvancedMetricsOptions {
  startDate?: string
  endDate?: string
  filters?: PipelineFiltersState
  enabled?: boolean
}

export function useBasicMetrics({
  startDate,
  endDate,
  enabled = true,
}: UseBasicMetricsOptions): ReturnType<typeof useQuery<MetricsResponse>> {
  return useQuery<MetricsResponse>({
    queryKey: ['pipeline-metrics', startDate, endDate],
    queryFn: () => crmLeadsService.getPipelineMetrics({ startDate, endDate }),
    refetchInterval: 60_000,
    enabled,
  })
}

export function useAdvancedMetrics({
  startDate,
  endDate,
  filters,
  enabled = true,
}: UseAdvancedMetricsOptions): ReturnType<typeof useQuery<AdvancedMetricsResponse>> {
  return useQuery<AdvancedMetricsResponse>({
    queryKey: ['pipeline-advanced-metrics', startDate, endDate, filters, enabled],
    queryFn: () => {
      if (filters) {
        return crmLeadsService.getPipelineAdvancedMetrics({
          startDate,
          endDate,
          stages: filters.stages,
          sources: filters.sources,
          assignedUsers: filters.assignedUsers,
          tags: filters.tags,
          valueMin:
            typeof filters.valueMin === 'string' && filters.valueMin.length > 0
              ? Number.parseFloat(filters.valueMin)
              : undefined,
          valueMax:
            typeof filters.valueMax === 'string' && filters.valueMax.length > 0
              ? Number.parseFloat(filters.valueMax)
              : undefined,
        })
      }
      return crmLeadsService.getPipelineAdvancedMetrics({ startDate, endDate })
    },
    refetchInterval: 60_000,
    enabled,
  })
}

export type { MetricsResponse }
