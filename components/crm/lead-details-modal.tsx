/**
 * Lead Details Modal - Modal para visualizar detalhes completos de um lead
 * Modal profissional com informações completas e ações
 */

'use client'

import { useState } from 'react'
import { 
  Star, 
  StarOff, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  DollarSign,
  MessageSquare,
  Edit,
  Trash,
  ExternalLink
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import crmLeadsService, { Lead, PipelineStage } from '@/services/crm-leads'

interface LeadDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  lead: Lead | null
  onEdit: (lead: Lead) => void
  onDelete: (lead: Lead) => void
  onFavoriteToggle: () => void
}

const STAGE_LABELS: Record<PipelineStage, string> = {
  [PipelineStage.LEAD]: 'Lead',
  [PipelineStage.CONTATO]: 'Contato', 
  [PipelineStage.PROPOSTA]: 'Proposta',
  [PipelineStage.NEGOCIACAO]: 'Negociação',
  [PipelineStage.FECHADO]: 'Fechado'
}

const STAGE_COLORS: Record<PipelineStage, string> = {
  [PipelineStage.LEAD]: 'bg-gray-100 text-gray-800',
  [PipelineStage.CONTATO]: 'bg-blue-100 text-blue-800',
  [PipelineStage.PROPOSTA]: 'bg-yellow-100 text-yellow-800',
  [PipelineStage.NEGOCIACAO]: 'bg-orange-100 text-orange-800',
  [PipelineStage.FECHADO]: 'bg-green-100 text-green-800'
}

export function LeadDetailsModal({ 
  isOpen, 
  onClose, 
  lead, 
  onEdit, 
  onDelete,
  onFavoriteToggle
}: LeadDetailsModalProps): React.ReactElement | null {
  const [isToggleLoading, setIsToggleLoading] = useState(false)
  const { toast } = useToast()

  if (!lead) return null

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const handleFavoriteToggle = async (): Promise<void> => {
    try {
      setIsToggleLoading(true)
      await crmLeadsService.toggleLeadFavorite(lead.id, !lead.is_favorite)
      
      toast({
        title: lead.is_favorite ? 'Lead removido dos favoritos' : 'Lead adicionado aos favoritos',
        description: `${lead.name} foi ${lead.is_favorite ? 'removido dos' : 'adicionado aos'} favoritos.`
      })
      
      onFavoriteToggle()
    } catch (error) {
      console.error('Erro ao alternar favorito:', error)
      toast({
        title: 'Erro ao atualizar favorito',
        description: 'Não foi possível atualizar o status de favorito.',
        variant: 'destructive'
      })
    } finally {
      setIsToggleLoading(false)
    }
  }

  const handleCall = (): void => {
    if (lead.phone) {
      window.open(`tel:${lead.phone}`, '_self')
    }
  }

  const handleEmail = (): void => {
    if (lead.email) {
      window.open(`mailto:${lead.email}`, '_blank')
    }
  }

  const handleWhatsApp = (): void => {
    if (lead.phone) {
      const cleanPhone = lead.phone.replace(/\\D/g, '')
      const message = encodeURIComponent(`Olá ${lead.name}, tudo bem?`)
      window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{lead.name}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteToggle}
                disabled={isToggleLoading}
                className="text-yellow-600 hover:text-yellow-700"
              >
                {lead.is_favorite ? (
                  <Star className="h-4 w-4 fill-current" />
                ) : (
                  <StarOff className="h-4 w-4" />
                )}
              </Button>
              <Badge className={STAGE_COLORS[lead.stage]}>
                {STAGE_LABELS[lead.stage]}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações de Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lead.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate flex-1" title={lead.email}>{lead.email}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleEmail}
                      className="h-6 w-6 p-0 flex-shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                {lead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate flex-1" title={lead.phone}>{lead.phone}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleCall}
                      className="h-6 w-6 p-0 flex-shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              {(lead.email || lead.phone) && (
                <div className="flex gap-2">
                  {lead.phone && (
                    <Button size="sm" variant="outline" onClick={handleCall}>
                      <Phone className="h-3 w-3 mr-1" />
                      Ligar
                    </Button>
                  )}
                  {lead.email && (
                    <Button size="sm" variant="outline" onClick={handleEmail}>
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </Button>
                  )}
                  {lead.phone && (
                    <Button size="sm" variant="outline" onClick={handleWhatsApp}>
                      <MessageSquare className="h-3 w-3 mr-1" />
                      WhatsApp
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações de Negócio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Informações de Negócio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Origem</p>
                  <p className="text-sm truncate" title={lead.source}>{lead.source}</p>
                </div>
                
                {lead.estimated_value && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor Estimado</p>
                    <p className="text-sm font-semibold text-green-600 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(lead.estimated_value)}
                    </p>
                  </div>
                )}
              </div>

              {lead.tags && lead.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {lead.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notas */}
          {lead.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {lead.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Criado em</p>
                  <p className="text-sm">{formatDate(lead.created_at)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Atualizado em</p>
                  <p className="text-sm">{formatDate(lead.updated_at)}</p>
                </div>
              </div>

              {lead.days_in_current_stage !== null && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tempo no estágio atual</p>
                  <p className="text-sm">
                    {lead.days_in_current_stage === 0 ? 'Hoje' : `${lead.days_in_current_stage} dias`}
                  </p>
                </div>
              )}

              {lead.last_contact_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Último contato</p>
                  <p className="text-sm">
                    {formatDate(lead.last_contact_at)}
                    {lead.last_contact_channel && ` via ${lead.last_contact_channel}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="border-t border-border my-4" />

        {/* Ações */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Fechar
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onEdit(lead)}
              className="flex items-center gap-1"
            >
              <Edit className="h-3 w-3" />
              Editar
            </Button>
            
            <Button
              variant="destructive"
              onClick={() => onDelete(lead)}
              className="flex items-center gap-1"
            >
              <Trash className="h-3 w-3" />
              Remover
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}