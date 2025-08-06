/**
 * Pipeline Kanban - CRM Pipeline Kanban Board
 * Kanban board para pipeline de vendas brasileiro
 * Baseado na especificação do agente 09-ui-ux-designer.md
 * Integrado com CRM API real
 */

'use client'

import { 
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  DollarSign,
  Building2,
  Clock,
  Star,
  AlertCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import crmLeadsService, { Lead, PipelineStage } from '@/services/crm-leads'
import { useAuthStore } from '@/stores/auth'
import { LeadCreateModal } from './lead-create-modal'
import { LeadDetailsModal } from './lead-details-modal'
import { LeadEditModal } from './lead-edit-modal'
import { LeadDeleteDialog } from './lead-delete-dialog'

interface PipelineStageDisplay {
  id: string
  name: string
  color: string
  count: number
  leads: Lead[]
}

interface PipelineKanbanProps {
  className?: string
}

const STAGE_DISPLAY_CONFIG: Record<PipelineStage, { name: string; color: string }> = {
  [PipelineStage.LEAD]: {
    name: 'Lead',
    color: 'bg-muted/50 border-border'
  },
  [PipelineStage.CONTATO]: {
    name: 'Contato',
    color: 'bg-blue-500/10 border-blue-500/20'
  },
  [PipelineStage.PROPOSTA]: {
    name: 'Proposta',
    color: 'bg-yellow-500/10 border-yellow-500/20'
  },
  [PipelineStage.NEGOCIACAO]: {
    name: 'Negociação',
    color: 'bg-orange-500/10 border-orange-500/20'
  },
  [PipelineStage.FECHADO]: {
    name: 'Fechado',
    color: 'bg-emerald-500/10 border-emerald-500/20'
  }
}

const getPriorityFromValue = (value?: number): 'low' | 'medium' | 'high' => {
  if (value == null || value === 0) {return 'low'}
  if (value >= 10_000) {return 'high'}
  if (value >= 5000) {return 'medium'}
  return 'low'
}

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high': {
      return 'text-red-600 dark:text-red-400'
    }
    case 'medium': {
      return 'text-yellow-600 dark:text-yellow-400'
    }
    case 'low': {
      return 'text-emerald-600 dark:text-emerald-400'
    }
    default: {
      return 'text-muted-foreground'
    }
  }
}

const getPriorityIcon = (priority: string): React.ReactNode => {
  switch (priority) {
    case 'high': {
      return <AlertCircle className="h-3 w-3" />
    }
    case 'medium': {
      return <Clock className="h-3 w-3" />
    }
    case 'low': {
      return <Star className="h-3 w-3" />
    }
    default: {
      return null
    }
  }
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

const handleDragOver = (e: React.DragEvent): void => {
  e.preventDefault()
}

function LoadingState({ className }: { className?: string }): React.ReactElement {
  return <div className={cn("h-full flex items-center justify-center", className)}>
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
      <p className="text-muted-foreground">Carregando pipeline...</p>
    </div>
  </div>
}

function ErrorState({ 
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

function StageHeader({ 
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

function LeadCard({ 
  lead, 
  onDragStart,
  onViewDetails,
  onEditLead,
  onSendEmail,
  onRemoveLead,
  onCall,
  onWhatsApp
}: { 
  lead: Lead
  onDragStart: (lead: Lead) => void
  onViewDetails: (lead: Lead) => void
  onEditLead: (lead: Lead) => void
  onSendEmail: (lead: Lead) => void
  onRemoveLead: (lead: Lead) => void
  onCall: (lead: Lead) => void
  onWhatsApp: (lead: Lead) => void
}): React.ReactElement {
  const priority = getPriorityFromValue(lead.estimated_value)
  
  return (
    <Card
      className="cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing w-full"
      draggable
      onDragStart={() => onDragStart(lead)}
    >
      <CardContent className="p-4">
        {/* Lead Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h4 
                className="font-semibold text-sm text-foreground truncate max-w-[200px]"
                title={lead.name}
              >
                {lead.name}
              </h4>
              {lead.is_favorite && (
                <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" />
              )}
            </div>
            {lead.source != null && lead.source.length > 0 ? <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 min-w-0">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate max-w-[180px]" title={lead.source}>
                  {lead.source}
                </span>
              </p> : null}
          </div>
          <div className="flex items-center gap-1">
            <div className={getPriorityColor(priority)}>
              {getPriorityIcon(priority)}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                  <span className="sr-only">Ações do lead</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(lead)}>
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditLead(lead)}>
                  Editar lead
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSendEmail(lead)}>
                  Enviar email
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => onRemoveLead(lead)}
                >
                  Remover lead
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Value */}
        {lead.estimated_value != null && lead.estimated_value > 0 ? (
          <div className="flex items-center gap-1 mb-2">
            <DollarSign className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {formatCurrency(lead.estimated_value)}
            </span>
          </div>
        ) : null}

        {/* Notes/Description */}
        {lead.notes != null && lead.notes.length > 0 ? (
          <p 
            className="text-xs text-muted-foreground mb-3 break-words overflow-hidden" 
            title={lead.notes}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {lead.notes}
          </p>
        ) : null}

        {/* Contact Info */}
        <div className="space-y-1 mb-3">
          {lead.email != null && lead.email.length > 0 ? (
            <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate max-w-[180px]" title={lead.email}>
                {lead.email}
              </span>
            </div>
          ) : null}
          {lead.phone != null && lead.phone.length > 0 ? (
            <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span className="truncate max-w-[180px]" title={lead.phone}>
                {lead.phone}
              </span>
            </div>
          ) : null}
        </div>

        {/* Tags */}
        {lead.tags != null && lead.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1 mb-3">
            {lead.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={`${tag}-${index}`}
                variant="outline"
                className="text-xs truncate max-w-[80px]"
                title={tag}
              >
                {tag}
              </Badge>
            ))}
            {lead.tags.length > 3 && (
              <Badge
                variant="secondary"
                className="text-xs cursor-default flex-shrink-0"
                title={`Mais ${lead.tags.length - 3} tags: ${lead.tags.slice(3).join(', ')}`}
              >
                +{lead.tags.length - 3}
              </Badge>
            )}
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {STAGE_DISPLAY_CONFIG[lead.stage].name}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {lead.days_in_current_stage === null ? 'Novo' : `${lead.days_in_current_stage}d`}
            </span>
          </div>
        </div>

        {/* Last Contact */}
        {lead.last_contact_at == null ? null : <div className="mt-2 pt-2 border-t border-border">
            <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
              <Calendar className="h-3 w-3" />
              <span>Último contato: {new Date(lead.last_contact_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>}

        {/* Quick Actions */}
        <div className="mt-3 flex gap-1">
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            className="flex-1 h-7 text-xs"
            onClick={() => onCall(lead)}
          >
            <Phone className="mr-1 h-3 w-3" />
            Ligar
          </Button>
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            className="flex-1 h-7 text-xs"
            onClick={() => onWhatsApp(lead)}
          >
            <MessageCircle className="mr-1 h-3 w-3" />
            WhatsApp
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AddLeadCard({ 
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

function StageColumn({ 
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

export function PipelineKanban({ className }: PipelineKanbanProps): React.ReactElement {
  const [stages, setStages] = useState<PipelineStageDisplay[]>([])
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createModalStage, setCreateModalStage] = useState<PipelineStage>(PipelineStage.LEAD)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const { user, organization } = useAuthStore()

  // Load leads data only when user and organization are available
  useEffect(() => {
    const loadLeadsData = async (): Promise<void> => {
      if (!user || !organization) {
        setLoading(true) // Keep loading while auth is being resolved
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        console.log('PipelineKanban: Loading leads data for user:', user.email, 'org:', organization.name)
        
        // Load leads grouped by stage
        const leadsByStage = await crmLeadsService.getLeadsByStage()
        
        // Build stages display data
        const stagesData: PipelineStageDisplay[] = Object.values(PipelineStage).map((stageKey) => {
          const config = STAGE_DISPLAY_CONFIG[stageKey]
          const stageLeads = leadsByStage[stageKey] || []
          
          return {
            id: stageKey,
            name: config.name,
            color: config.color,
            count: stageLeads.length,
            leads: stageLeads
          }
        })

        setStages(stagesData)
      } catch (error_) {
        const errorMessage = error_ instanceof Error ? error_.message : 'Erro desconhecido'
        setError(`Erro ao carregar dados do pipeline: ${errorMessage}`)
      } finally {
        setLoading(false)
      }
    }

    void loadLeadsData()
  }, [user, organization])

  const handleDragStart = (lead: Lead): void => {
    setDraggedLead(lead)
  }

  const handleDrop = async (targetStageId: string): Promise<void> => {
    if (draggedLead == null) {return}

    const targetStage = targetStageId as PipelineStage
    const currentStage = draggedLead.stage

    // Don't do anything if dropping on the same stage
    if (currentStage === targetStage) {
      setDraggedLead(null)
      return
    }

    try {
      // Optimistically update UI
      setStages(prevStages => {
        return prevStages.map(stage => {
          if (stage.leads.some(lead => lead.id === draggedLead.id)) {
            // Remove from current stage
            return {
              ...stage,
              leads: stage.leads.filter(lead => lead.id !== draggedLead.id),
              count: stage.count - 1
            }
          } else if (stage.id === targetStageId) {
            // Add to target stage with updated stage
            const updatedLead = { ...draggedLead, stage: targetStage }
            return {
              ...stage,
              leads: [...stage.leads, updatedLead],
              count: stage.count + 1
            }
          }
          return stage
        })
      })

      // Update via API
      await crmLeadsService.moveLeadToStage(
        draggedLead.id,
        targetStage,
        `Moved from ${STAGE_DISPLAY_CONFIG[currentStage].name} to ${STAGE_DISPLAY_CONFIG[targetStage].name}`
      )

    } catch (error_) {
      const errorMessage = error_ instanceof Error ? error_.message : 'Erro desconhecido'
      
      // Revert optimistic update on error
      setStages(prevStages => {
        return prevStages.map(stage => {
          if (stage.id === targetStageId) {
            // Remove from target stage
            return {
              ...stage,
              leads: stage.leads.filter(lead => lead.id !== draggedLead.id),
              count: stage.count - 1
            }
          } else if (stage.id === currentStage) {
            // Add back to original stage
            return {
              ...stage,
              leads: [...stage.leads, draggedLead],
              count: stage.count + 1
            }
          }
          return stage
        })
      })

      setError(`Erro ao mover lead: ${errorMessage}`)
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000)
    } finally {
      setDraggedLead(null)
    }
  }

  // Reload leads data
  const reloadLeadsData = async (): Promise<void> => {
    if (!user || !organization) return

    try {
      setLoading(true)
      setError(null)
      
      const leadsByStage = await crmLeadsService.getLeadsByStage()
      
      const stagesData: PipelineStageDisplay[] = Object.values(PipelineStage).map((stageKey) => {
        const config = STAGE_DISPLAY_CONFIG[stageKey]
        const stageLeads = leadsByStage[stageKey] || []
        
        return {
          id: stageKey,
          name: config.name,
          color: config.color,
          count: stageLeads.length,
          leads: stageLeads
        }
      })

      setStages(stagesData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(`Erro ao recarregar dados do pipeline: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Button handlers
  const handleAddLead = (stageId?: string): void => {
    const targetStage = stageId ? stageId as PipelineStage : PipelineStage.LEAD
    setCreateModalStage(targetStage)
    setIsCreateModalOpen(true)
  }

  const handleCreateSuccess = (): void => {
    // Reload pipeline data after successful creation
    void reloadLeadsData()
  }

  const handleModalClose = (): void => {
    setSelectedLead(null)
    setIsDetailsModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteDialogOpen(false)
  }

  const handleEditSuccess = (): void => {
    // Reload pipeline data after successful edit
    void reloadLeadsData()
  }

  const handleDeleteSuccess = (): void => {
    // Reload pipeline data after successful deletion
    void reloadLeadsData()
  }

  const handleFavoriteToggle = (): void => {
    // Reload pipeline data after favorite toggle
    void reloadLeadsData()
  }

  const handleEditFromDetails = (lead: Lead): void => {
    setIsDetailsModalOpen(false)
    setSelectedLead(lead)
    setIsEditModalOpen(true)
  }

  const handleDeleteFromDetails = (lead: Lead): void => {
    setIsDetailsModalOpen(false)
    setSelectedLead(lead)
    setIsDeleteDialogOpen(true)
  }

  const handleViewDetails = (lead: Lead): void => {
    setSelectedLead(lead)
    setIsDetailsModalOpen(true)
  }

  const handleEditLead = (lead: Lead): void => {
    setSelectedLead(lead)
    setIsEditModalOpen(true)
  }

  const handleSendEmail = (lead: Lead): void => {
    console.log('Enviar email para:', lead.email)
    if (lead.email) {
      window.open(`mailto:${lead.email}`, '_blank')
    } else {
      alert(`Lead ${lead.name} não possui email cadastrado`)
    }
  }

  const handleRemoveLead = (lead: Lead): void => {
    setSelectedLead(lead)
    setIsDeleteDialogOpen(true)
  }

  const handleCall = (lead: Lead): void => {
    console.log('Ligar para:', lead.phone)
    if (lead.phone) {
      window.open(`tel:${lead.phone}`, '_self')
    } else {
      alert(`Lead ${lead.name} não possui telefone cadastrado`)
    }
  }

  const handleWhatsApp = (lead: Lead): void => {
    console.log('Enviar WhatsApp para:', lead.phone)
    if (lead.phone) {
      // Format phone number for WhatsApp (remove special chars)
      const cleanPhone = lead.phone.replaceAll(/\D/g, '')
      const message = encodeURIComponent(`Olá ${lead.name}, tudo bem?`)
      window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank')
    } else {
      alert(`Lead ${lead.name} não possui telefone cadastrado`)
    }
  }

  // Show loading state while auth is loading or while fetching data
  if (!user || !organization || loading) {
    return <LoadingState className={className} />
  }

  // Show error state
  if (error != null) {
    return <ErrorState error={error} className={className} />
  }

  return (
    <div className={cn("h-full", className)}>
      <div className="flex gap-6 h-full overflow-x-auto">
        {stages.map((stage) => (
          <StageColumn
            key={stage.id}
            stage={stage}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onAddLead={handleAddLead}
            onViewDetails={handleViewDetails}
            onEditLead={handleEditLead}
            onSendEmail={handleSendEmail}
            onRemoveLead={handleRemoveLead}
            onCall={handleCall}
            onWhatsApp={handleWhatsApp}
          />
        ))}
      </div>

      {/* Modal de criação de lead */}
      <LeadCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        initialStage={createModalStage}
      />

      {/* Modal de detalhes do lead */}
      <LeadDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleModalClose}
        lead={selectedLead}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteFromDetails}
        onFavoriteToggle={handleFavoriteToggle}
      />

      {/* Modal de edição do lead */}
      <LeadEditModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        onSuccess={handleEditSuccess}
        lead={selectedLead}
      />

      {/* Dialog de confirmação de remoção */}
      <LeadDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleModalClose}
        onSuccess={handleDeleteSuccess}
        lead={selectedLead}
      />
    </div>
  )
}