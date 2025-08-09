/**
 * Pipeline Kanban Inner Component
 * Extracted from main component to reduce complexity
 */
'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'

import { crmLeadsService } from '@/services/crm-leads'
import { useAuthStore } from '@/stores/auth'

import { usePipelineDataHandlers } from './pipeline-data-handlers'
import { createInitialFilters, createFilterUpdater } from './pipeline-filters-utils'
import { usePipelineHandlers } from './pipeline-handlers'
import { LoadingState, ErrorState } from './pipeline-kanban-helpers'
import { PipelineKanbanLayout } from './pipeline-kanban-main-layout'
import { applyFiltersToStages, isTruthy } from './pipeline-kanban-utils'
import { usePipelineWebSocketHandlers } from './pipeline-websocket-handlers'

import type { PipelineFiltersState } from './pipeline-filters-types'

interface PipelineKanbanInnerProps {
  className?: string
}

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

function useFilterOptions(): { filterOptions: typeof MOCK_FILTER_OPTIONS; isLoading: boolean } {
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

export function PipelineKanbanInner({ className }: PipelineKanbanInnerProps): React.ReactElement {
  const { user, organization } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'kanban' | 'metrics' | 'advanced'>('kanban')
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)
  const [filters, setFilters] = useState<PipelineFiltersState>(createInitialFilters)

  const { filterOptions, isLoading: isLoadingFilters } = useFilterOptions()

  // Use extracted data handlers
  const { stages, loading, error, reloadLeadsData, setStages, setError } = usePipelineDataHandlers()

  // Use extracted WebSocket handlers
  const { isConnected, isPolling, activeUsers, sendMessage } = usePipelineWebSocketHandlers(
    reloadLeadsData,
    stages,
    setStages
  )

  // Use extracted pipeline handlers
  const pipelineHandlers = usePipelineHandlers(reloadLeadsData)

  // Apply filters to stages data
  const filteredStages = useMemo(() => {
    return applyFiltersToStages(stages, filters)
  }, [stages, filters])

  // Filter utilities
  const updateFilter = createFilterUpdater(setFilters)
  const clearAllFilters = (): void => setFilters(createInitialFilters())

  const handleDragDrop = async (targetStageId: string): Promise<void> => {
    if (isTruthy(pipelineHandlers.draggedLead)) {
      sendMessage({
        type: 'lead_drag_start',
        leadId: pipelineHandlers.draggedLead.id,
        timestamp: new Date().toISOString(),
      })
    }

    await pipelineHandlers.handleDrop({
      targetStageId,
      sendMessage,
      setStages,
      setError,
    })
  }

  // Show loading state while auth is loading or while fetching data
  if (!isTruthy(user) || !isTruthy(organization) || loading) {
    return <LoadingState className={className} />
  }

  // Show error state
  if (isTruthy(error)) {
    return <ErrorState error={error} className={className} />
  }

  return (
    <PipelineKanbanLayout
      className={className}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      currentFilters={filters}
      onFiltersChange={setFilters}
      filteredStages={filteredStages}
      pipelineHandlers={pipelineHandlers}
      onDragDrop={(stageId: string) => {
        void handleDragDrop(stageId)
      }}
      isConnected={isConnected}
      isPolling={isPolling}
      activeUsers={activeUsers}
      isFiltersExpanded={isFiltersExpanded}
      onToggleFilters={() => setIsFiltersExpanded(!isFiltersExpanded)}
      filters={filters}
      filterOptions={filterOptions}
      updateFilter={updateFilter}
      onClearAllFilters={clearAllFilters}
      isLoadingFilters={isLoadingFilters}
    />
  )
}
