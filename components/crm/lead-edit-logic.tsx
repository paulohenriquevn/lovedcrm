/**
 * Lead Edit Logic Hook
 * Extracted complex logic from LeadEditModal to reduce complexity
 */

import { useState } from 'react'

import { useToast } from '@/hooks/use-toast'
import {
  default as crmLeadsService,
  PipelineStage,
  type Lead,
  type LeadUpdate,
} from '@/services/crm-leads'

interface LeadEditForm {
  name: string
  email?: string
  phone?: string
  stage: PipelineStage
  source?: string
  estimatedValue?: number
  notes?: string
  isFavorite?: boolean
}

interface UseLeadEditLogicProps {
  lead: Lead | null
  currentTags: string[]
  onClose: () => void
  onSuccess: () => void
}

interface EditLogicReturn {
  isLoading: boolean
  onSubmit: (data: LeadEditForm) => Promise<void>
}

function hasChanged(newValue: string | undefined, oldValue: string | undefined): boolean {
  return (newValue ?? '') !== (oldValue ?? '')
}

function shouldUpdateField(newValue: string | undefined): string | undefined {
  return newValue !== null && newValue !== undefined && newValue.trim() !== ''
    ? newValue
    : undefined
}

function buildBasicFields(data: LeadEditForm, lead: Lead): Partial<LeadUpdate> {
  const updates: Partial<LeadUpdate> = {}

  if (data.name !== lead.name) {
    updates.name = data.name
  }

  if (hasChanged(data.email, lead.email)) {
    updates.email = shouldUpdateField(data.email)
  }

  if (hasChanged(data.phone, lead.phone)) {
    updates.phone = shouldUpdateField(data.phone)
  }

  return updates
}

function buildMetadataFields(
  data: LeadEditForm,
  lead: Lead,
  currentTags: string[]
): Partial<LeadUpdate> {
  const updates: Partial<LeadUpdate> = {}

  if (hasChanged(data.source, lead.source)) {
    updates.source = shouldUpdateField(data.source)
  }

  if (data.estimatedValue !== lead.estimated_value) {
    updates.estimated_value = data.estimatedValue
  }

  if (JSON.stringify(currentTags) !== JSON.stringify(lead.tags ?? [])) {
    updates.tags = currentTags.length > 0 ? currentTags : undefined
  }

  if (hasChanged(data.notes, lead.notes)) {
    updates.notes = shouldUpdateField(data.notes)
  }

  return updates
}

export function useLeadEditLogic({
  lead,
  currentTags,
  onClose,
  onSuccess,
}: UseLeadEditLogicProps): EditLogicReturn {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const buildUpdateData = (data: LeadEditForm, lead: Lead): LeadUpdate => {
    const basicFields = buildBasicFields(data, lead)
    const metadataFields = buildMetadataFields(data, lead, currentTags)

    return { ...basicFields, ...metadataFields }
  }

  const onSubmit = async (data: LeadEditForm): Promise<void> => {
    if (!lead) {
      return
    }

    try {
      setIsLoading(true)
      const updateData = buildUpdateData(data, lead)

      // Update basic lead data
      if (Object.keys(updateData).length > 0) {
        await crmLeadsService.updateLead(lead.id, updateData)
      }

      // Update favorite status if changed
      if (data.isFavorite !== lead.is_favorite) {
        await crmLeadsService.toggleLeadFavorite(lead.id, data.isFavorite ?? false)
      }

      // Update stage if changed
      if (data.stage !== lead.stage) {
        await crmLeadsService.moveLeadToStage(lead.id, data.stage, 'Estágio alterado via edição')
      }

      toast({
        title: 'Lead atualizado com sucesso',
        description: `${data.name} foi atualizado no pipeline.`,
      })

      onClose()
      onSuccess()
    } catch {
      toast({
        title: 'Erro ao atualizar lead',
        description: 'Não foi possível atualizar o lead. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    onSubmit,
  }
}
