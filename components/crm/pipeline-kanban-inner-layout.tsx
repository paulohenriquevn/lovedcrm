/**
 * Pipeline Kanban Inner Layout Component
 * Extracted JSX render logic to reduce function size
 */
'use client'

import React from 'react'

import { BulkOperationsPanel } from './bulk-operations-panel'
import { PipelineKanbanLayout } from './pipeline-kanban-main-layout'

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

interface PipelineKanbanInnerLayoutProps {
  className?: string
  activeTab: 'kanban' | 'metrics' | 'advanced'
  onTabChange: (tab: 'kanban' | 'metrics' | 'advanced') => void
  currentFilters: PipelineFiltersState
  onFiltersChange: (filters: PipelineFiltersState) => void
  filteredStages: PipelineStageDisplay[]
  pipelineHandlers: PipelineHandlers
  onDragDrop: (stageId: string) => void
  isConnected: boolean
  isPolling: boolean
  activeUsers: Array<{ user_id?: string; full_name?: string }>
  isFiltersExpanded: boolean
  onToggleFilters: () => void
  filters: PipelineFiltersState
  filterOptions: Record<string, unknown>
  updateFilter: (key: string, value: unknown) => void
  onClearAllFilters: () => void
  isLoadingFilters: boolean
  selectedLeadIds: string[]
  onToggleSelection: (leadId: string) => void
  bulkSelection: {
    selectedCount: number
    getSelectedLeads: () => string[]
    hasSelection: boolean
    clearSelection: () => void
  }
  bulkHandlers: {
    handleBulkDelete: () => Promise<void>
    handleBulkStageMove: (leadIds: string[], stage: string) => Promise<void>
    handleBulkAssign: (leadIds: string[], userId: string) => Promise<void>
  }
  availableUsers?: Array<{ id: string; name: string }>
}

export function PipelineKanbanInnerLayout({
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
  selectedLeadIds,
  onToggleSelection,
  bulkSelection,
  bulkHandlers,
  availableUsers,
}: PipelineKanbanInnerLayoutProps): React.ReactElement {
  return (
    <>
      <PipelineKanbanLayout
        className={className}
        activeTab={activeTab}
        onTabChange={onTabChange}
        currentFilters={currentFilters}
        onFiltersChange={onFiltersChange}
        filteredStages={filteredStages}
        pipelineHandlers={pipelineHandlers}
        onDragDrop={onDragDrop}
        isConnected={isConnected}
        isPolling={isPolling}
        activeUsers={activeUsers}
        isFiltersExpanded={isFiltersExpanded}
        onToggleFilters={onToggleFilters}
        filters={filters}
        filterOptions={filterOptions}
        updateFilter={updateFilter}
        onClearAllFilters={onClearAllFilters}
        isLoadingFilters={isLoadingFilters}
        selectedLeadIds={selectedLeadIds}
        onToggleSelection={onToggleSelection}
      />

      {/* Bulk Operations Panel - Fixed positioned overlay */}
      <BulkOperationsPanel
        selectedCount={bulkSelection.selectedCount}
        selectedLeadIds={bulkSelection.getSelectedLeads()}
        isVisible={bulkSelection.hasSelection}
        onClearSelection={bulkSelection.clearSelection}
        onBulkDelete={bulkHandlers.handleBulkDelete}
        onBulkStageMove={(leadIds, stage) => bulkHandlers.handleBulkStageMove(leadIds, stage)}
        onBulkAssign={bulkHandlers.handleBulkAssign}
        availableUsers={availableUsers}
        position="bottom"
      />
    </>
  )
}
