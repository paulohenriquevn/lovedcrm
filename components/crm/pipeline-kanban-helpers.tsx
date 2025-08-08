/**
 * Pipeline Kanban Helper Components
 * Extracted helper components to reduce file complexity
 */
import { Plus, AlertCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Lead, PipelineStage } from '@/services/crm-leads'

import { LeadCard } from './lead-card-components'
import { LeadCreateModal } from './lead-create-modal'
import { LeadDeleteDialog } from './lead-delete-dialog'
import { LeadDetailsModal } from './lead-details-modal'
import { LeadEditModal } from './lead-edit-modal'
import { PipelineStageDisplay } from './pipeline-types'

const handleDragOver = (e: React.DragEvent): void => {
  e.preventDefault()
}

export function LoadingState({ className }: { className?: string }): React.ReactElement {
  return <div className={cn("h-full flex items-center justify-center", className)}>
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
      <p className="text-muted-foreground">Carregando pipeline...</p>
    </div>
  </div>
}

export function ErrorState({ 
  error, 
  className 
}: { 
  error: string
  className?: string 
}): React.ReactElement {
  return <div className={cn("h-full flex items-center justify-center", className)}>
    <div className="text-center">
      <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
      <p className="text-red-600 mb-4">{error}</p>
      <Button 
        type="button"
        variant="outline" 
        onClick={() => window.location.reload()}
      >
        Tentar novamente
      </Button>
    </div>
  </div>
}

export function StageHeader({ 
  stage, 
  onAddLead 
}: { 
  stage: PipelineStageDisplay
  onAddLead: () => void 
}): React.ReactElement {
  return <Card className={cn("mb-4", stage.color)}>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">
            {stage.name}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {stage.count}
          </Badge>
        </div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={onAddLead}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Adicionar lead</span>
        </Button>
      </div>
    </CardHeader>
  </Card>
}

export function AddLeadCard({ 
  onAddLead 
}: { 
  onAddLead: () => void 
}): React.ReactElement {
  return <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
    <CardContent className="p-6 text-center">
      <Button 
        type="button" 
        variant="ghost" 
        className="h-auto p-2 text-muted-foreground hover:text-primary"
        onClick={onAddLead}
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Lead
      </Button>
    </CardContent>
  </Card>
}

export function StageColumn({ 
  stage, 
  onDragStart, 
  onDrop,
  onAddLead,
  onViewDetails,
  onEditLead,
  onSendEmail,
  onRemoveLead,
  onCall,
  onWhatsApp
}: { 
  stage: PipelineStageDisplay
  onDragStart: (lead: Lead) => void
  onDrop: (stageId: string) => void
  onAddLead: (stageId?: string) => void
  onViewDetails: (lead: Lead) => void
  onEditLead: (lead: Lead) => void
  onSendEmail: (lead: Lead) => void
  onRemoveLead: (lead: Lead) => void
  onCall: (lead: Lead) => void
  onWhatsApp: (lead: Lead) => void
}): React.ReactElement {
  return <div
    className="w-[320px] flex-shrink-0"
    onDragOver={handleDragOver}
    onDrop={() => onDrop(stage.id)}
  >
    <StageHeader 
      stage={stage} 
      onAddLead={() => onAddLead(stage.id)} 
    />
    <div className="space-y-3 min-h-[600px]">
      {stage.leads.map((lead) => (
        <LeadCard 
          key={lead.id} 
          lead={lead} 
          onDragStart={onDragStart}
          onViewDetails={onViewDetails}
          onEditLead={onEditLead}
          onSendEmail={onSendEmail}
          onRemoveLead={onRemoveLead}
          onCall={onCall}
          onWhatsApp={onWhatsApp}
        />
      ))}
      <AddLeadCard onAddLead={() => onAddLead(stage.id)} />
    </div>
  </div>
}

// Helper component for connection status indicator
export function ConnectionStatusIndicator({ 
  isConnected, 
  isPolling 
}: { 
  isConnected: boolean
  isPolling: boolean 
}): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "h-2 w-2 rounded-full",
        isConnected ? "bg-emerald-500" : 
        isPolling ? "bg-amber-500" : "bg-red-500"
      )} />
      <span className="text-xs text-muted-foreground">
        {isConnected ? 'Conectado - Updates em tempo real' : 
         isPolling ? 'Modo Fallback - Updates via polling' :
         'Desconectado - Sem updates automáticos'}
      </span>
    </div>
  )
}

// Helper component for active users display
export function ActiveUsersDisplay({ 
  activeUsers 
}: { 
  activeUsers: { user_id?: string; full_name?: string }[]
}): React.ReactElement | null {
  if (activeUsers.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">
        {activeUsers.length} {activeUsers.length === 1 ? 'usuário ativo' : 'usuários ativos'}
      </span>
      <div className="flex -space-x-1">
        {activeUsers.slice(0, 3).map((activeUser, index) => (
          <div
            key={activeUser.user_id ?? `user-${index}`}
            className="h-6 w-6 rounded-full bg-primary/20 border border-background flex items-center justify-center"
            title={activeUser.full_name ?? 'Usuário ativo'}
          >
            <span className="text-xs font-medium">
              {(activeUser.full_name ?? 'U').charAt(0).toUpperCase()}
            </span>
          </div>
        ))}
        {activeUsers.length > 3 && (
          <div className="h-6 w-6 rounded-full bg-muted border border-background flex items-center justify-center">
            <span className="text-xs">+{activeUsers.length - 3}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper component for connection status header
export function ConnectionStatusHeader({ 
  isConnected, 
  isPolling, 
  activeUsers 
}: { 
  isConnected: boolean
  isPolling: boolean
  activeUsers: { user_id?: string; full_name?: string }[]
}): React.ReactElement {
  return (
    <div className="flex items-center justify-between mb-4 p-2 bg-muted/30 rounded-lg">
      <ConnectionStatusIndicator 
        isConnected={isConnected} 
        isPolling={isPolling} 
      />
      <ActiveUsersDisplay activeUsers={activeUsers} />
    </div>
  )
}

// Helper component for modals section
export function PipelineModals({
  isCreateModalOpen,
  onCreateModalClose,
  onCreateSuccess,
  createModalStage,
  isDetailsModalOpen,
  onModalClose,
  selectedLead,
  onEditFromDetails,
  onDeleteFromDetails,
  onFavoriteToggle,
  isEditModalOpen,
  onEditSuccess,
  isDeleteDialogOpen,
  onDeleteSuccess
}: {
  isCreateModalOpen: boolean
  onCreateModalClose: () => void
  onCreateSuccess: () => void
  createModalStage: PipelineStage
  isDetailsModalOpen: boolean
  onModalClose: () => void
  selectedLead: Lead | null
  onEditFromDetails: (lead: Lead) => void
  onDeleteFromDetails: (lead: Lead) => void
  onFavoriteToggle: () => void
  isEditModalOpen: boolean
  onEditSuccess: () => void
  isDeleteDialogOpen: boolean
  onDeleteSuccess: () => void
}): React.ReactElement {
  return (
    <>
      <LeadCreateModal 
        isOpen={isCreateModalOpen} 
        onClose={onCreateModalClose} 
        onSuccess={onCreateSuccess} 
        initialStage={createModalStage} 
      />
      <LeadDetailsModal 
        isOpen={isDetailsModalOpen} 
        onClose={onModalClose} 
        lead={selectedLead} 
        onEdit={onEditFromDetails} 
        onDelete={onDeleteFromDetails} 
        onFavoriteToggle={onFavoriteToggle} 
      />
      <LeadEditModal 
        isOpen={isEditModalOpen} 
        onClose={onModalClose} 
        onSuccess={onEditSuccess} 
        lead={selectedLead} 
      />
      <LeadDeleteDialog 
        isOpen={isDeleteDialogOpen} 
        onClose={onModalClose} 
        onSuccess={onDeleteSuccess} 
        lead={selectedLead} 
      />
    </>
  )
}