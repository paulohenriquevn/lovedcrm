/**
 * Pipeline Layout Components
 * Complex layout components extracted from pipeline-kanban-layout
 */

import { PipelineFiltersHorizontalPanel, type PipelineFiltersState } from './pipeline-filters'
import { PipelineHeader, KanbanBoard } from './pipeline-kanban-layout'
import { PipelineMetrics } from './pipeline-metrics'

import type { PipelineStageDisplay } from './pipeline-types'
import type { Lead } from '@/services/crm-leads'

interface PipelineLayoutWithFiltersProps {
  activeTab: 'kanban' | 'metrics' | 'advanced'
  onTabChange: (tab: 'kanban' | 'metrics' | 'advanced') => void
  isConnected: boolean
  isPolling: boolean
  activeUsers: string[]
  isFiltersExpanded: boolean
  onToggleFilters: () => void
  filteredStages: PipelineStageDisplay[] | null
  pipelineHandlers: {
    handleDragStart: (leadId: string) => void
    handleAddLead: (stageId: string) => void
    handleViewDetails: (leadId: string) => void
    handleEditLead: (leadId: string) => void
    handleSendEmail: (leadId: string) => void
    handleRemoveLead: (leadId: string) => void
    handleCall: (leadId: string) => void
    handleWhatsApp: (leadId: string) => void
    draggedLead?: Lead | null
    isDragging?: boolean
  }
  onDrop: (stageId: string) => void
  currentFilters: PipelineFiltersState
  filters: PipelineFiltersState
  filterOptions?: {
    stages?: string[]
    sources?: string[]
    assigned_users?: Array<{ id: string; name: string }>
    available_tags?: string[]
  }
  updateFilter: <K extends keyof PipelineFiltersState>(
    key: K,
    value: PipelineFiltersState[K]
  ) => void
  onClearAllFilters: () => void
  isLoadingFilters: boolean
}

export function PipelineLayoutWithFilters({
  activeTab,
  onTabChange,
  isConnected,
  isPolling,
  activeUsers,
  isFiltersExpanded,
  onToggleFilters,
  filteredStages,
  pipelineHandlers,
  onDrop,
  currentFilters,
  filters,
  filterOptions,
  updateFilter,
  onClearAllFilters,
  isLoadingFilters,
}: PipelineLayoutWithFiltersProps): JSX.Element {
  return (
    <div className="h-full">
      {/* Header com tabs e botão de filtros */}
      <PipelineHeader
        activeTab={activeTab}
        onTabChange={onTabChange}
        isConnected={isConnected}
        isPolling={isPolling}
        activeUsers={activeUsers}
        isFiltersExpanded={isFiltersExpanded}
        onToggleFilters={onToggleFilters}
      />

      {/* Painel Horizontal de Filtros */}
      <PipelineFiltersHorizontalPanel
        isExpanded={isFiltersExpanded}
        filters={filters}
        filterOptions={filterOptions}
        updateFilter={updateFilter}
        onClearAll={onClearAllFilters}
        isLoading={isLoadingFilters}
      />

      {/* Conteúdo principal baseado na tab ativa */}
      <div className="flex-1 h-[calc(100%-120px)] overflow-hidden">
        {activeTab === 'kanban' && (
          <KanbanBoard
            filteredStages={filteredStages ?? []}
            pipelineHandlers={pipelineHandlers}
            onDrop={onDrop}
            draggedLead={pipelineHandlers.draggedLead ?? null}
          />
        )}
        {activeTab === 'metrics' && (
          <PipelineMetrics filteredStages={filteredStages} currentFilters={currentFilters} />
        )}
        {activeTab === 'advanced' && (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Funcionalidades Avançadas</h3>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </div>
        )}
      </div>
    </div>
  )
}
