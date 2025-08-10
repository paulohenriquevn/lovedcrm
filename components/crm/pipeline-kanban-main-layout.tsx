/**
 * Pipeline Kanban Main Layout Component
 * Complete layout wrapper for better organization
 */

import { cn } from '@/lib/utils'

import { PipelineLayoutWithFilters } from './pipeline-layout-components'
import { PipelineModals } from './pipeline-modal-components'

import type { PipelineFiltersState } from './pipeline-filters-types'
import type { PipelineStageDisplay, DragParams } from './pipeline-types'
import type { Lead, PipelineStage } from '@/services/crm-leads'

interface PipelineHandlers {
  draggedLead: Lead | null
  handleDragStart: (lead: Lead) => void
  handleDrop: (params: DragParams) => Promise<void>
  handleAddLead: (stageId?: string) => void
  handleViewDetails: (lead: Lead) => void
  handleEditLead: (lead: Lead) => void
  handleSendEmail: (lead: Lead) => void
  handleRemoveLead: (lead: Lead) => void
  handleCall: (lead: Lead) => void
  handleWhatsApp: (lead: Lead) => void
  isCreateModalOpen: boolean
  handleCreateModalClose: () => void
  handleCreateSuccess: () => void
  createModalStage: PipelineStage | null
  isDetailsModalOpen: boolean
  handleModalClose: () => void
  selectedLead: Lead | null
  handleEditFromDetails: (lead: Lead) => void
  handleDeleteFromDetails: (lead: Lead) => void
  handleFavoriteToggle: () => void
  isEditModalOpen: boolean
  handleEditSuccess: () => void
  isDeleteDialogOpen: boolean
  handleDeleteSuccess: () => void
}

interface PipelineKanbanLayoutProps {
  className?: string
  activeTab: 'kanban' | 'metrics' | 'advanced'
  onTabChange: (tab: 'kanban' | 'metrics' | 'advanced') => void
  currentFilters: PipelineFiltersState
  onFiltersChange: (filters: PipelineFiltersState) => void
  filteredStages: PipelineStageDisplay[] | null
  pipelineHandlers: PipelineHandlers
  onDragDrop: (stageId: string) => void
  isConnected: boolean
  isPolling: boolean
  activeUsers: Array<{ user_id?: string; full_name?: string }>
  isFiltersExpanded: boolean
  onToggleFilters: () => void
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

export function PipelineKanbanLayout({
  className,
  activeTab,
  onTabChange,
  currentFilters,
  onFiltersChange,
  filteredStages,
  pipelineHandlers,
  onDragDrop,
  isConnected,
  isPolling,
  activeUsers,
  isFiltersExpanded,
  onToggleFilters,
  filters,
  filterOptions,
  updateFilter,
  onClearAllFilters,
  isLoadingFilters,
}: PipelineKanbanLayoutProps): JSX.Element {
  return (
    <div className={cn('h-full', className)}>
      <PipelineLayoutWithFilters
        activeTab={activeTab}
        onTabChange={onTabChange}
        onFiltersChange={onFiltersChange}
        isConnected={isConnected}
        isPolling={isPolling}
        activeUsers={activeUsers}
        isFiltersExpanded={isFiltersExpanded}
        onToggleFilters={onToggleFilters}
        filteredStages={filteredStages}
        pipelineHandlers={pipelineHandlers}
        onDrop={(stageId: string) => {
          void onDragDrop(stageId)
        }}
        currentFilters={currentFilters}
        filters={filters}
        filterOptions={filterOptions}
        updateFilter={updateFilter}
        onClearAllFilters={onClearAllFilters}
        isLoadingFilters={isLoadingFilters}
      />

      <PipelineModals
        isCreateModalOpen={pipelineHandlers.isCreateModalOpen}
        onCreateModalClose={pipelineHandlers.handleCreateModalClose}
        onCreateSuccess={pipelineHandlers.handleCreateSuccess}
        createModalStage={pipelineHandlers.createModalStage}
        isDetailsModalOpen={pipelineHandlers.isDetailsModalOpen}
        onModalClose={pipelineHandlers.handleModalClose}
        selectedLead={pipelineHandlers.selectedLead}
        onEditFromDetails={pipelineHandlers.handleEditFromDetails}
        onDeleteFromDetails={pipelineHandlers.handleDeleteFromDetails}
        onFavoriteToggle={pipelineHandlers.handleFavoriteToggle}
        isEditModalOpen={pipelineHandlers.isEditModalOpen}
        onEditSuccess={pipelineHandlers.handleEditSuccess}
        isDeleteDialogOpen={pipelineHandlers.isDeleteDialogOpen}
        onDeleteSuccess={pipelineHandlers.handleDeleteSuccess}
      />
    </div>
  )
}
