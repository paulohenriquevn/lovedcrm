/**
 * Pipeline Kanban Inner Component
 * Extracted from main component to reduce complexity
 */
'use client'

import { useState, Dispatch, SetStateAction } from 'react'

import { useAuthStore } from '@/stores/auth'

import { usePipelineDataHandlers } from './pipeline-data-handlers'
import { createInitialFilters, createFilterUpdater } from './pipeline-filters-utils'
import { usePipelineHandlers } from './pipeline-handlers'
import { LoadingState, ErrorState } from './pipeline-kanban-helpers'
import { useBulkOperationsHandlers } from './pipeline-kanban-inner-bulk'
import { createDragDropHandler } from './pipeline-kanban-inner-drag'
import { useFilterOptions } from './pipeline-kanban-inner-hooks'
import { PipelineKanbanInnerLayout } from './pipeline-kanban-inner-layout'
import { usePipelineSelection } from './pipeline-kanban-inner-selection'
import { isTruthy } from './pipeline-kanban-utils'
import { usePipelineWebSocketHandlers } from './pipeline-websocket-handlers'

import type { PipelineFiltersState } from './pipeline-filters-types'

interface PipelineKanbanInnerProps {
  className?: string
}

// Split the main component function into smaller parts
function usePipelineState(): {
  activeTab: 'kanban' | 'metrics' | 'advanced'
  setActiveTab: (tab: 'kanban' | 'metrics' | 'advanced') => void
  isFiltersExpanded: boolean
  setIsFiltersExpanded: (expanded: boolean) => void
  filters: PipelineFiltersState
  setFilters: Dispatch<SetStateAction<PipelineFiltersState>>
} {
  const [activeTab, setActiveTab] = useState<'kanban' | 'metrics' | 'advanced'>('kanban')
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)
  const [filters, setFilters] = useState<PipelineFiltersState>(createInitialFilters)

  return {
    activeTab,
    setActiveTab,
    isFiltersExpanded,
    setIsFiltersExpanded,
    filters,
    setFilters,
  }
}

export function PipelineKanbanInner({ className }: PipelineKanbanInnerProps): React.ReactElement {
  const { user, organization } = useAuthStore()
  const { filterOptions, isLoading: isLoadingFilters } = useFilterOptions()
  const { stages, loading, error, reloadLeadsData, setStages, setError } = usePipelineDataHandlers()
  const { isConnected, isPolling, activeUsers, sendMessage } = usePipelineWebSocketHandlers(
    reloadLeadsData,
    stages,
    setStages
  )
  const pipelineHandlers = usePipelineHandlers(reloadLeadsData)
  const { activeTab, setActiveTab, isFiltersExpanded, setIsFiltersExpanded, filters, setFilters } =
    usePipelineState()

  // Bulk operations handlers - MUST be called before any conditional returns
  const bulkHandlers = useBulkOperationsHandlers(reloadLeadsData, setError)

  // Pipeline selection and filtering
  const { filteredStages, bulkSelection } = usePipelineSelection(stages ?? [], filters)

  // Filter utilities
  const updateFilter = createFilterUpdater(setFilters)
  const clearAllFilters = (): void => setFilters(createInitialFilters())

  // Drag and drop handler
  const handleDragDrop = createDragDropHandler({
    pipelineHandlers,
    sendMessage,
    setStages,
    setError,
  })

  // Show loading state while auth is loading or while fetching data
  if (!isTruthy(user) || !isTruthy(organization) || loading) {
    return <LoadingState className={className} />
  }

  // Show error state
  if (isTruthy(error)) {
    return <ErrorState error={error} className={className} />
  }

  return (
    <PipelineKanbanInnerLayout
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
      updateFilter={updateFilter as (key: string, value: unknown) => void}
      onClearAllFilters={clearAllFilters}
      isLoadingFilters={isLoadingFilters}
      selectedLeadIds={bulkSelection.getSelectedLeads()}
      onToggleSelection={bulkSelection.toggleLead}
      bulkSelection={bulkSelection}
      bulkHandlers={bulkHandlers}
      availableUsers={filterOptions?.assigned_users}
    />
  )
}
