/**
 * Pipeline Kanban Layout Components - Clean Version
 * Simplified layout components for better maintainability
 */

import { BarChart3, Filter, Kanban, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { StageColumn, PipelineGhostOverlay } from './pipeline-kanban-helpers'
import { ConnectionStatusHeader } from './pipeline-status-components'

import type { PipelineFiltersState } from './pipeline-filters'
import type { PipelineStageDisplay } from './pipeline-types'
import type { Lead } from '@/services/crm-leads'

interface TabNavigationProps {
  activeTab: 'kanban' | 'metrics' | 'advanced'
  onTabChange: (tab: 'kanban' | 'metrics' | 'advanced') => void
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps): JSX.Element {
  return (
    <Tabs
      value={activeTab}
      onValueChange={value => onTabChange(value as 'kanban' | 'metrics' | 'advanced')}
    >
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="kanban" className="flex items-center gap-2 flex-1 sm:flex-initial">
          <Kanban className="h-4 w-4" />
          <span className="hidden sm:inline">Kanban</span>
        </TabsTrigger>
        <TabsTrigger value="metrics" className="flex items-center gap-2 flex-1 sm:flex-initial">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Métricas</span>
        </TabsTrigger>
        <TabsTrigger value="advanced" className="flex items-center gap-2 flex-1 sm:flex-initial">
          <TrendingUp className="h-4 w-4" />
          <span className="hidden sm:inline">Avançado</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

interface HeaderControlsProps {
  onFiltersChange: (filters: PipelineFiltersState) => void
  onToggleFilters: () => void
  isFiltersExpanded: boolean
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

export function HeaderControls({
  onToggleFilters,
  isFiltersExpanded,
}: Pick<HeaderControlsProps, 'onToggleFilters' | 'isFiltersExpanded'>): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onToggleFilters} className="gap-2">
        <Filter className="h-4 w-4" />
        {isFiltersExpanded ? 'Ocultar' : 'Filtros'}
      </Button>
    </div>
  )
}

interface PipelineHeaderProps {
  activeTab: 'kanban' | 'metrics' | 'advanced'
  onTabChange: (tab: 'kanban' | 'metrics' | 'advanced') => void
  isConnected: boolean
  isPolling: boolean
  activeUsers: Array<{ user_id?: string; full_name?: string }>
  isFiltersExpanded: boolean
  onToggleFilters: () => void
}

export function PipelineHeader({
  activeTab,
  onTabChange,
  isConnected,
  isPolling,
  activeUsers,
  isFiltersExpanded,
  onToggleFilters,
}: PipelineHeaderProps): JSX.Element {
  const activeUsersData = activeUsers.map((user, index) => ({
    // eslint-disable-next-line camelcase
    user_id: user.user_id ?? `user-${index}`,
    // eslint-disable-next-line camelcase
    full_name: user.full_name,
  }))

  return (
    <div className="space-y-4 mb-4">
      <ConnectionStatusHeader
        isConnected={isConnected}
        isPolling={isPolling}
        activeUsers={activeUsersData}
      />
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />
        <HeaderControls onToggleFilters={onToggleFilters} isFiltersExpanded={isFiltersExpanded} />
      </div>
    </div>
  )
}

interface KanbanBoardProps {
  filteredStages: PipelineStageDisplay[]
  pipelineHandlers: {
    handleDragStart: (lead: Lead) => void
    handleAddLead: (stageId?: string) => void
    handleViewDetails: (lead: Lead) => void
    handleEditLead: (lead: Lead) => void
    handleSendEmail: (lead: Lead) => void
    handleRemoveLead: (lead: Lead) => void
    handleCall: (lead: Lead) => void
    handleWhatsApp: (lead: Lead) => void
  }
  onDrop: (stageId: string) => void
  draggedLead?: Lead | null
  selectedLeadIds?: string[]
  onToggleSelection?: (leadId: string) => void
}

export function KanbanBoard({
  filteredStages,
  pipelineHandlers,
  onDrop,
  draggedLead = null,
  selectedLeadIds = [],
  onToggleSelection,
}: KanbanBoardProps): JSX.Element {
  return (
    <>
      <div className="flex gap-6 h-full overflow-x-auto">
        {filteredStages.map(stage => (
          <StageColumn
            key={stage.id}
            stage={stage}
            onDragStart={pipelineHandlers.handleDragStart}
            onDrop={onDrop}
            onAddLead={pipelineHandlers.handleAddLead}
            onViewDetails={pipelineHandlers.handleViewDetails}
            onEditLead={pipelineHandlers.handleEditLead}
            onSendEmail={pipelineHandlers.handleSendEmail}
            onRemoveLead={pipelineHandlers.handleRemoveLead}
            onCall={pipelineHandlers.handleCall}
            onWhatsApp={pipelineHandlers.handleWhatsApp}
            draggedLead={draggedLead}
            selectedLeadIds={selectedLeadIds}
            onToggleSelection={onToggleSelection}
          />
        ))}
      </div>

      {/* Ghost overlay for drag operations */}
      <PipelineGhostOverlay draggedLead={draggedLead} isDragging={draggedLead !== null} />
    </>
  )
}
