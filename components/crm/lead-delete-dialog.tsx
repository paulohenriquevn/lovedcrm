/**
 * Lead Delete Dialog - Confirmação para remoção de leads
 * Dialog de confirmação com informações sobre o lead a ser removido
 */

'use client'

import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { default as crmLeadsService, Lead } from '@/services/crm-leads'

interface LeadDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  lead: Lead | null
}

function LeadValueWarning({ lead }: { lead: Lead }): React.ReactElement | null {
  if (
    lead.estimated_value === null ||
    lead.estimated_value === undefined ||
    lead.estimated_value <= 0
  ) {
    return null
  }

  return (
    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
      <p className="text-sm text-orange-800">
        ⚠️ Este lead tem um valor estimado de{' '}
        <strong>
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(lead.estimated_value)}
        </strong>
      </p>
    </div>
  )
}

export function LeadDeleteDialog({
  isOpen,
  onClose,
  onSuccess,
  lead,
}: LeadDeleteDialogProps): React.ReactElement {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async (): Promise<void> => {
    if (!lead) {
      return
    }

    try {
      setIsDeleting(true)

      await crmLeadsService.deleteLead(lead.id)

      toast({
        title: 'Lead removido com sucesso',
        description: `${lead.name} foi removido do pipeline.`,
      })

      onClose()
      onSuccess()
    } catch {
      // Error handling - replace with proper logging in production
      toast({
        title: 'Erro ao remover lead',
        description: 'Não foi possível remover o lead. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (!lead) {
    return null
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirmar Remoção
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Tem certeza que deseja remover o lead <strong>&ldquo;{lead.name}&rdquo;</strong>?
              </p>
              <p className="text-sm text-muted-foreground">
                Esta ação não pode ser desfeita. Todas as informações do lead serão perdidas
                permanentemente.
              </p>
              <LeadValueWarning lead={lead} />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={() => void handleDelete()} disabled={isDeleting}>
            {isDeleting ? 'Removendo...' : 'Sim, remover lead'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
