/**
 * Pipeline Kanban - CRM Pipeline Kanban Board
 * Kanban board para pipeline de vendas brasileiro
 * Baseado na especificação do agente 09-ui-ux-designer.md
 * Integrado com CRM API real
 */
'use client'

import { BarChart3, Kanban } from 'lucide-react'
import { useState, useMemo } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'

import { usePipelineDataHandlers } from './pipeline-data-handlers'
import { PipelineFilters, type PipelineFiltersState } from './pipeline-filters'
import { usePipelineHandlers } from './pipeline-handlers'
import {
  LoadingState,
  ErrorState,
  StageColumn,
  ConnectionStatusHeader,
  PipelineModals,
} from './pipeline-kanban-helpers'
import { PipelineMetrics } from './pipeline-metrics'
import { usePipelineWebSocketHandlers } from './pipeline-websocket-handlers'

interface PipelineKanbanProps {
  className?: string
}

export function PipelineKanban({ className }: PipelineKanbanProps): React.ReactElement {
  return <PipelineKanbanInner className={className} />
}

function PipelineKanbanInner({ className }: PipelineKanbanProps): React.ReactElement {
  const { user, organization } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'kanban' | 'metrics'>('kanban')
  const [currentFilters, setCurrentFilters] = useState<PipelineFiltersState>({
    stages: [],
    sources: [],
    assignedUsers: [],
    tags: [],
    dateFrom: null,
    dateTo: null,
    valueMin: '',
    valueMax: ''
  })

  // Use extracted data handlers
  const { stages, loading, error, reloadLeadsData, setStages, setError } = usePipelineDataHandlers()

  // Use extracted WebSocket handlers
  const { isConnected, isPolling, activeUsers, sendMessage } =
    usePipelineWebSocketHandlers(reloadLeadsData)

  // Use extracted pipeline handlers
  const pipelineHandlers = usePipelineHandlers(reloadLeadsData)

  // Apply filters to stages data
  const filteredStages = useMemo(() => {
    if (!stages) {return stages}

    return stages.map(stage => {
      let filteredLeads = stage.leads

      // Apply stage filter
      if (currentFilters.stages.length > 0 && !currentFilters.stages.includes(stage.id)) {
        filteredLeads = []
      } else {
        // Apply other filters
        filteredLeads = filteredLeads.filter(lead => {
          // Source filter
          if (currentFilters.sources.length > 0 && !currentFilters.sources.includes(lead.source)) {
            return false
          }

          // Assigned user filter
          if (currentFilters.assignedUsers.length > 0 && (!lead.assigned_user_id || !currentFilters.assignedUsers.includes(lead.assigned_user_id))) {
              return false
            }

          // Tags filter
          if (currentFilters.tags.length > 0 && (!lead.tags || !currentFilters.tags.some(tag => lead.tags?.includes(tag)))) {
              return false
            }

          // Date range filter
          if (currentFilters.dateFrom && new Date(lead.created_at) < currentFilters.dateFrom) {
            return false
          }
          if (currentFilters.dateTo && new Date(lead.created_at) > currentFilters.dateTo) {
            return false
          }

          // Value range filter
          if (currentFilters.valueMin && (!lead.estimated_value || lead.estimated_value < Number.parseFloat(currentFilters.valueMin))) {
            return false
          }
          if (currentFilters.valueMax && (!lead.estimated_value || lead.estimated_value > Number.parseFloat(currentFilters.valueMax))) {
            return false
          }

          return true
        })
      }

      return { ...stage, leads: filteredLeads }
    })
  }, [stages, currentFilters])

  const handleDragDrop = async (targetStageId: string): Promise<void> => {
    if (pipelineHandlers.draggedLead) {
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
  if (!user || !organization || loading) {
    return <LoadingState className={className} />
  }

  // Show error state
  if (error !== null && error !== undefined) {
    return <ErrorState error={error} className={className} />
  }

  return (
    <div className={cn('h-full', className)}>
      <div className="flex items-center justify-between mb-4 flex-col sm:flex-row gap-4 sm:gap-0">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'kanban' | 'metrics')}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="kanban" className="flex items-center gap-2 flex-1 sm:flex-initial">
              <Kanban className="h-4 w-4" />
              <span className="hidden sm:inline">Kanban</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2 flex-1 sm:flex-initial">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Métricas</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <PipelineFilters onFiltersChange={setCurrentFilters} />
          <ConnectionStatusHeader
            isConnected={isConnected}
            isPolling={isPolling}
            activeUsers={activeUsers}
          />
        </div>
      </div>

      <Tabs value={activeTab}>
        <TabsContent value="kanban" className="h-full mt-0">
          <div className="flex gap-6 h-full overflow-x-auto">
            {filteredStages?.map(stage => (
              <StageColumn
                key={stage.id}
                stage={stage}
                onDragStart={pipelineHandlers.handleDragStart}
                onDrop={(stageId: string) => {
                  void handleDragDrop(stageId)
                }}
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
        </TabsContent>

        <TabsContent value="metrics" className="h-full mt-0">
          <PipelineMetrics
            startDate={currentFilters.dateFrom?.toISOString()}
            endDate={currentFilters.dateTo?.toISOString()}
          />
        </TabsContent>
      </Tabs>

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
