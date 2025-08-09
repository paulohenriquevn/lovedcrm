/**
 * Pipeline Kanban Main Layout Component
 * Complete layout wrapper for better organization
 */

import { cn } from '@/lib/utils'

import { PipelineModals } from './pipeline-kanban-helpers'
import { PipelineHeader, PipelineContent } from './pipeline-kanban-layout'

import type { PipelineFiltersState } from './pipeline-filters-types'
import type { PipelineStageDisplay } from './pipeline-types'

interface LeadBase {
  id: string
  name: string
  stage?: string
}

interface PipelineHandlers {
  draggedLead: LeadBase | null
  handleDragStart: (leadId: string) => void
  handleDrop: (params: { stageId: string; leadId: string }) => Promise<void>
  handleAddLead: (stageId: string) => void
  handleViewDetails: (leadId: string) => void
  handleEditLead: (leadId: string) => void
  handleSendEmail: (leadId: string) => void
  handleRemoveLead: (leadId: string) => void
  handleCall: (leadId: string) => void
  handleWhatsApp: (leadId: string) => void
  isCreateModalOpen: boolean
  handleCreateModalClose: () => void
  handleCreateSuccess: () => void
  createModalStage: string | null
  isDetailsModalOpen: boolean
  handleModalClose: () => void
  selectedLead: LeadBase | null
  handleEditFromDetails: () => void
  handleDeleteFromDetails: () => void
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
  activeUsers: string[]
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
}: PipelineKanbanLayoutProps): JSX.Element {
  return (
    <div className={cn('h-full', className)}>
      <PipelineHeader
        activeTab={activeTab}
        onTabChange={onTabChange}
        onFiltersChange={onFiltersChange}
        isConnected={isConnected}
        isPolling={isPolling}
        activeUsers={activeUsers}
      />

      <PipelineContent
        activeTab={activeTab}
        filteredStages={filteredStages}
        pipelineHandlers={pipelineHandlers}
        onDrop={(stageId: string) => {
          void onDragDrop(stageId)
        }}
        currentFilters={currentFilters}
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
