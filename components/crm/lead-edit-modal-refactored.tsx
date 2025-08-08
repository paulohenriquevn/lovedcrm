/**
 * Lead Edit Modal - Modal para edição de leads (Refactored)
 * Simplified modal with extracted components for better maintainability
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PipelineStage, type Lead } from '@/services/crm-leads'

import { useLeadEditLogic } from './lead-edit-logic'
import { LeadEditModalForm } from './lead-edit-modal-form'
import {
  LeadEditForm,
  createDefaultFormValues,
  populateFormWithLeadData,
  resetFormState,
  handleTagOperations,
} from './lead-edit-modal-helpers'

interface LeadEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  lead: Lead | null
}

const leadEditSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().max(50, 'Telefone muito longo').optional().or(z.literal('')),
  stage: z.nativeEnum(PipelineStage),
  source: z.string().max(100, 'Source muito longo').optional().or(z.literal('')),
  estimatedValue: z.coerce.number().min(0, 'Valor deve ser positivo').optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional().or(z.literal('')),
  isFavorite: z.boolean().optional(),
})

function useLeadEditModalState(): {
  currentTags: string[]
  setCurrentTags: (tags: string[]) => void
  tagInput: string
  setTagInput: (input: string) => void
} {
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  return {
    currentTags,
    setCurrentTags,
    tagInput,
    setTagInput,
  }
}

export function LeadEditModalRefactored({
  isOpen,
  onClose,
  onSuccess,
  lead,
}: LeadEditModalProps): React.ReactElement | null {
  const { currentTags, setCurrentTags, tagInput, setTagInput } = useLeadEditModalState()

  const form = useForm<LeadEditForm>({
    resolver: zodResolver(leadEditSchema),
    defaultValues: createDefaultFormValues(),
  })

  const handleClose = useCallback((): void => {
    resetFormState(form, setCurrentTags, setTagInput)
    onClose()
  }, [form, setCurrentTags, setTagInput, onClose])

  const { onSubmit, isLoading } = useLeadEditLogic({
    lead,
    currentTags,
    onClose: handleClose,
    onSuccess,
  })

  const { addTag, removeTag, handleTagKeyPress } = handleTagOperations({
    currentTags,
    tagInput,
    setCurrentTags,
    setTagInput,
    form,
  })

  // Populate form when lead changes
  useEffect(() => {
    if (lead && isOpen) {
      populateFormWithLeadData(form, lead, setCurrentTags)
    }
  }, [lead, isOpen, form, setCurrentTags])

  const handleFormSubmit = useCallback(
    (e: React.FormEvent): void => {
      e.preventDefault()
      const formData = form.getValues()
      void onSubmit(formData)
    },
    [form, onSubmit]
  )

  if (!lead) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
        </DialogHeader>

        <LeadEditModalForm
          form={form}
          isLoading={isLoading}
          currentTags={currentTags}
          tagInput={tagInput}
          onTagInputChange={setTagInput}
          onAddTag={addTag}
          onRemoveTag={removeTag}
          onTagKeyPress={handleTagKeyPress}
          onSubmit={handleFormSubmit}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  )
}
