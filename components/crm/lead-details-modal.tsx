/**
 * Lead Details Modal - Modal para visualizar detalhes completos de um lead
 * Modal profissional com informações completas e ações
 */

'use client'

import { useState } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { default as crmLeadsService, Lead } from '@/services/crm-leads'

import { LeadCommunication } from './lead-communication'
import {
  LeadDetailsHeader,
  ContactInfoCard,
  LeadValueCard,
  TimelineCard,
  TagsSection,
  NotesSection,
} from './lead-details-components'

interface LeadDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  lead: Lead | null
  onEdit: (lead: Lead) => void
  onDelete: (lead: Lead) => void
  onFavoriteToggle: () => void
}

function useFavoriteToggle(
  lead: Lead,
  onFavoriteToggle: () => void
): { isToggleLoading: boolean; handleFavoriteToggle: () => Promise<void> } {
  const [isToggleLoading, setIsToggleLoading] = useState(false)
  const { toast } = useToast()

  const handleFavoriteToggle = async (): Promise<void> => {
    try {
      setIsToggleLoading(true)
      await crmLeadsService.toggleLeadFavorite(lead.id, !lead.is_favorite)

      toast({
        title: lead.is_favorite ? 'Lead removido dos favoritos' : 'Lead adicionado aos favoritos',
        description: `${lead.name} foi ${lead.is_favorite ? 'removido dos' : 'adicionado aos'} favoritos.`,
      })

      onFavoriteToggle()
    } catch {
      toast({
        title: 'Erro ao alterar favorito',
        description: 'Não foi possível alterar o status de favorito. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsToggleLoading(false)
    }
  }

  return {
    isToggleLoading,
    handleFavoriteToggle,
  }
}

export function LeadDetailsModal({
  isOpen,
  onClose,
  lead,
  onEdit,
  onDelete,
  onFavoriteToggle,
}: LeadDetailsModalProps): React.ReactElement | null {
  const { toast } = useToast()

  // eslint-disable-next-line camelcase
  const defaultLead = { id: '', name: '', is_favorite: false } as Lead
  const { isToggleLoading, handleFavoriteToggle } = useFavoriteToggle(
    lead ?? defaultLead,
    onFavoriteToggle
  )

  const handleSendMessage = async (message: string, templateId?: string): Promise<void> => {
    // This would integrate with your messaging service
    // TODO: Replace console.log with actual messaging service integration
    // eslint-disable-next-line no-console
    console.log('Sending message to lead:', lead?.name, message, templateId)

    // Simulate async operation - remove this when implementing real messaging service
    await new Promise(resolve => setTimeout(resolve, 100))

    toast({
      title: 'Mensagem enviada',
      description: `Mensagem enviada para ${lead?.name} com sucesso.`,
    })
  }

  if (!lead) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <LeadDetailsHeader
            lead={lead}
            isToggleLoading={isToggleLoading}
            onFavoriteToggle={() => void handleFavoriteToggle()}
            onEdit={onEdit}
            onDelete={onDelete}
            onClose={onClose}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <ContactInfoCard lead={lead} />
            <LeadValueCard lead={lead} />
          </div>

          <TimelineCard lead={lead} />
          <TagsSection lead={lead} />
          <NotesSection lead={lead} />

          {/* Lead Communication with Template Suggestions */}
          <LeadCommunication lead={lead} onSendMessage={handleSendMessage} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
