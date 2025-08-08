/**
 * Pipeline Kanban - CRM Pipeline Kanban Board
 * Kanban board para pipeline de vendas brasileiro
 * Baseado na especificação do agente 09-ui-ux-designer.md
 * Integrado com CRM API real
 */
'use client'

import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'

import { usePipelineDataHandlers } from './pipeline-data-handlers'
import { usePipelineHandlers } from './pipeline-handlers'
import { 
  LoadingState, 
  ErrorState, 
  StageColumn, 
  ConnectionStatusHeader,
  PipelineModals 
} from './pipeline-kanban-helpers'
import { usePipelineWebSocketHandlers } from './pipeline-websocket-handlers'

interface PipelineKanbanProps {
  className?: string
}

export function PipelineKanban({ className }: PipelineKanbanProps): React.ReactElement {
  console.log('📋 PipelineKanban wrapper rendering')
  
  return (
    <PipelineKanbanInner className={className} />
  )
}

function PipelineKanbanInner({ className }: PipelineKanbanProps): React.ReactElement {
  console.log('📊 PipelineKanbanInner rendering')
  
  const { user, organization } = useAuthStore()
  console.log('👤 Auth state:', { user: !!user, org: !!organization })
  
  // Use extracted data handlers
  const { stages, loading, error, reloadLeadsData, setStages, setError } = usePipelineDataHandlers()
  
  // Use extracted WebSocket handlers
  const { isConnected, isPolling, activeUsers, sendMessage } = usePipelineWebSocketHandlers(reloadLeadsData)
  
  // Use extracted pipeline handlers
  const pipelineHandlers = usePipelineHandlers(reloadLeadsData)
  
  const handleDragDrop = async (targetStageId: string): Promise<void> => {
    console.log('🎯 handleDragDrop called:', { 
      targetStageId, 
      draggedLead: !!pipelineHandlers.draggedLead,
      isConnected 
    })
    
    if (pipelineHandlers.draggedLead) {
      console.log('📤 Sending lead_drag_start message')
      sendMessage({
        type: 'lead_drag_start',
        leadId: pipelineHandlers.draggedLead.id,
        timestamp: new Date().toISOString()
      })
    }
    
    await pipelineHandlers.handleDrop({
      targetStageId,
      sendMessage,
      setStages,
      setError
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
    <div className={cn("h-full", className)}>
      <ConnectionStatusHeader 
        isConnected={isConnected}
        isPolling={isPolling}
        activeUsers={activeUsers}
      />
      
      <div className="flex gap-6 h-full overflow-x-auto">
        {stages.map((stage) => (
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