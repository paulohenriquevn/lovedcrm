/**
 * Pipeline Kanban Layout Components
 * Extracted layout components for better maintainability
 */

import { BarChart3, Kanban, TrendingUp } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  PipelineFilters,
  PipelineFiltersHorizontalPanel,
  type PipelineFiltersState,
} from './pipeline-filters'
import { ConnectionStatusHeader, StageColumn } from './pipeline-kanban-helpers'
import { PipelineMetrics } from './pipeline-metrics'

import type { PipelineStageDisplay } from './pipeline-types'

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
  isConnected: boolean
  isPolling: boolean
  activeUsers: string[]
  isFiltersExpanded: boolean
  onToggleFilters: () => void
}

export function HeaderControls({
  onFiltersChange,
  isConnected,
  isPolling,
  activeUsers,
  isFiltersExpanded,
  onToggleFilters,
}: HeaderControlsProps): JSX.Element {
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
      <PipelineFilters
        onFiltersChange={onFiltersChange}
        isExpanded={isFiltersExpanded}
        onToggleExpanded={onToggleFilters}
      />
      <ConnectionStatusHeader
        isConnected={isConnected}
        isPolling={isPolling}
        activeUsers={activeUsers}
      />
    </div>
  )
}

interface PipelineHeaderProps {
  activeTab: 'kanban' | 'metrics' | 'advanced'
  onTabChange: (tab: 'kanban' | 'metrics' | 'advanced') => void
  onFiltersChange: (filters: PipelineFiltersState) => void
  isConnected: boolean
  isPolling: boolean
  activeUsers: string[]
  isFiltersExpanded: boolean
  onToggleFilters: () => void
}

export function PipelineHeader({
  activeTab,
  onTabChange,
  onFiltersChange,
  isConnected,
  isPolling,
  activeUsers,
  isFiltersExpanded,
  onToggleFilters,
}: PipelineHeaderProps): JSX.Element {
  return (
    <div className="flex items-center justify-between mb-4 flex-col sm:flex-row gap-4 sm:gap-0">
      <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />
      <HeaderControls
        onFiltersChange={onFiltersChange}
        isConnected={isConnected}
        isPolling={isPolling}
        activeUsers={activeUsers}
        isFiltersExpanded={isFiltersExpanded}
        onToggleFilters={onToggleFilters}
      />
    </div>
  )
}

interface KanbanBoardProps {
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
  }
  onDrop: (stageId: string) => void
}

export function KanbanBoard({
  filteredStages,
  pipelineHandlers,
  onDrop,
}: KanbanBoardProps): JSX.Element {
  return (
    <div className="flex gap-6 h-full overflow-x-auto">
      {filteredStages?.map(stage => (
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
        />
      ))}
    </div>
  )
}

interface MetricsViewProps {
  dateFrom: Date | null
  dateTo: Date | null
}

export function MetricsView({ dateFrom, dateTo }: MetricsViewProps): JSX.Element {
  return <PipelineMetrics startDate={dateFrom?.toISOString()} endDate={dateTo?.toISOString()} />
}

interface AdvancedMetricsViewProps {
  filters: PipelineFiltersState
}

export function AdvancedMetricsView({ filters }: AdvancedMetricsViewProps): JSX.Element {
  return (
    <PipelineMetrics
      startDate={filters.dateFrom?.toISOString()}
      endDate={filters.dateTo?.toISOString()}
      filters={filters}
      enableAdvanced
    />
  )
}

interface PipelineContentProps {
  activeTab: 'kanban' | 'metrics' | 'advanced'
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
  }
  onDrop: (stageId: string) => void
  currentFilters: PipelineFiltersState
}

export function PipelineContent({
  activeTab,
  filteredStages,
  pipelineHandlers,
  onDrop,
  currentFilters,
}: PipelineContentProps): JSX.Element {
  return (
    <Tabs value={activeTab}>
      <TabsContent value="kanban" className="h-full mt-0">
        <KanbanBoard
          filteredStages={filteredStages}
          pipelineHandlers={pipelineHandlers}
          onDrop={onDrop}
        />
      </TabsContent>

      <TabsContent value="metrics" className="h-full mt-0">
        <MetricsView dateFrom={currentFilters.dateFrom} dateTo={currentFilters.dateTo} />
      </TabsContent>

      <TabsContent value="advanced" className="h-full mt-0">
        <AdvancedMetricsView filters={currentFilters} />
      </TabsContent>
    </Tabs>
  )
}

// Novo componente que engloba toda a estrutura com filtros horizontais
interface PipelineLayoutWithFiltersProps {
  activeTab: 'kanban' | 'metrics' | 'advanced'
  onTabChange: (tab: 'kanban' | 'metrics' | 'advanced') => void
  onFiltersChange: (filters: PipelineFiltersState) => void
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
  onFiltersChange,
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
        onFiltersChange={onFiltersChange}
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

      {/* Conteúdo principal (Kanban, Métricas, etc) */}
      <PipelineContent
        activeTab={activeTab}
        filteredStages={filteredStages}
        pipelineHandlers={pipelineHandlers}
        onDrop={onDrop}
        currentFilters={currentFilters}
      />
    </div>
  )
}
