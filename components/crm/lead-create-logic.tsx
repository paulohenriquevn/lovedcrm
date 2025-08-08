/**
 * Lead Create Logic - Extracted submission logic from LeadCreateModal
 * Separated to reduce function complexity and improve maintainability
 */

'use client'

import { useToast } from '@/hooks/use-toast'
import { default as crmLeadsService, PipelineStage, type LeadCreate } from '@/services/crm-leads'

interface LeadCreateForm {
  name: string
  email?: string
  phone?: string
  stage: PipelineStage
  source?: string
  estimatedValue?: number
  tags?: string[]
  notes?: string
}

interface UseLeadCreateLogicProps {
  currentTags: string[]
  onClose: () => void
  onSuccess: () => void
}

const STAGE_LABELS: Record<PipelineStage, string> = {
  [PipelineStage.LEAD]: 'Lead',
  [PipelineStage.CONTATO]: 'Contato',
  [PipelineStage.PROPOSTA]: 'Proposta',
  [PipelineStage.NEGOCIACAO]: 'Negociação',
  [PipelineStage.FECHADO]: 'Fechado',
}

// Helper functions to reduce complexity
function normalizeStringValue(value?: string): string | undefined {
  return value !== null && value !== undefined && value !== '' ? value : undefined
}

function prepareLeadData(data: LeadCreateForm, currentTags: string[]): LeadCreate {
  return {
    name: data.name,
    email: normalizeStringValue(data.email),
    phone: normalizeStringValue(data.phone),
    stage: data.stage,
    source: normalizeStringValue(data.source) ?? 'Website',
    estimatedValue: data.estimatedValue ?? undefined,
    tags: currentTags.length > 0 ? currentTags : undefined,
    notes: normalizeStringValue(data.notes),
  }
}

export function useLeadCreateLogic({ currentTags, onClose, onSuccess }: UseLeadCreateLogicProps): {
  handleSubmit: (data: LeadCreateForm, setIsLoading: (loading: boolean) => void) => Promise<void>
} {
  const { toast } = useToast()

  const handleSubmit = async (
    data: LeadCreateForm,
    setIsLoading: (loading: boolean) => void
  ): Promise<void> => {
    try {
      setIsLoading(true)

      const leadData = prepareLeadData(data, currentTags)
      await crmLeadsService.createLead(leadData)

      toast({
        title: 'Lead criado com sucesso!',
        description: `${leadData.name} foi adicionado ao pipeline no estágio ${STAGE_LABELS[data.stage]}.`,
      })

      onClose()
      onSuccess()
    } catch {
      toast({
        title: 'Erro ao criar lead',
        description: 'Não foi possível criar o lead. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return { handleSubmit }
}
