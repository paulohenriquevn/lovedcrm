/**
 * Pipeline Kanban Inner Hooks
 * Custom hooks for pipeline kanban functionality
 */
'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { crmLeadsService } from '@/services/crm-leads'

const MOCK_FILTER_OPTIONS = {
  stages: ['lead', 'contato', 'proposta', 'negociacao', 'fechado'],
  sources: ['Website', 'WhatsApp', 'Facebook', 'Instagram', 'Indicação', 'Google'],
  // eslint-disable-next-line camelcase
  assigned_users: [
    { id: '1', name: 'João Silva' },
    { id: '2', name: 'Maria Santos' },
    { id: '3', name: 'Pedro Costa' },
  ],
  // eslint-disable-next-line camelcase
  available_tags: ['Urgente', 'VIP', 'Prospecção', 'Reativação', 'Newsletter'],
}

export function useFilterOptions(): {
  filterOptions: typeof MOCK_FILTER_OPTIONS
  isLoading: boolean
} {
  const {
    data: filterOptions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['pipeline-filter-options'],
    queryFn: () => crmLeadsService.getPipelineFilters(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on failure, use mock data
  })

  // Use API data or fallback to mock data for development
  const effectiveFilterOptions = filterOptions ?? MOCK_FILTER_OPTIONS

  // Don't show loading if we're using mock data
  const effectiveIsLoading = isLoading && error === null

  // Log only when using mock data for development
  if (!filterOptions && process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('💡 Using mock filter data (API not available)')
  }

  return { filterOptions: effectiveFilterOptions, isLoading: effectiveIsLoading }
}

export function useBulkSelectionData(filteredStages: Array<{ leads?: Array<{ id: string }> }>): {
  allLeadIds: string[]
} {
  // Extract all lead IDs for bulk operations
  const allLeadIds = useMemo(() => {
    if (filteredStages === null || filteredStages === undefined) {
      return []
    }
    return filteredStages.flatMap(stage => stage.leads?.map(lead => lead.id) ?? [])
  }, [filteredStages])

  return { allLeadIds }
}
