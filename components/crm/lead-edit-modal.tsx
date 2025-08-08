/**
 * Lead Edit Modal - Modal para edição de leads
 * Modal completo para editar leads existentes com validação
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { PipelineStage, type Lead } from '@/services/crm-leads'

import { LeadEditFormFields } from './lead-edit-form-fields'
import {
  type LeadEditForm,
  initializeFormWithLead,
  resetForm,
  getDefaultFormValues,
} from './lead-edit-form-helpers'
import { useLeadEditLogic } from './lead-edit-logic'
import { useTagManager } from './lead-edit-tags-manager'

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

export function LeadEditModal({
  isOpen,
  onClose,
  onSuccess,
  lead,
}: LeadEditModalProps): React.ReactElement | null {
  const form = useForm<LeadEditForm>({
    resolver: zodResolver(leadEditSchema),
    defaultValues: getDefaultFormValues(),
  })

  const tagManager = useTagManager(form)

  const { isLoading, onSubmit } = useLeadEditLogic({
    lead,
    currentTags: tagManager.currentTags,
    onClose,
    onSuccess,
  })

  useEffect(() => {
    if (lead && isOpen) {
      initializeFormWithLead(form, lead, tagManager.setCurrentTags)
    }
  }, [lead, isOpen, form, tagManager.setCurrentTags])

  const handleClose = (): void => {
    resetForm(form, tagManager.setCurrentTags, tagManager.setTagInput)
    onClose()
  }

  if (!lead) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={e => {
              e.preventDefault()
              void form.handleSubmit(onSubmit)(e)
            }}
            className="space-y-4"
          >
            <LeadEditFormFields
              form={form}
              isLoading={isLoading}
              currentTags={tagManager.currentTags}
              tagInput={tagManager.tagInput}
              handleTagInputChange={tagManager.setTagInput}
              handleAddTag={tagManager.addTag}
              handleRemoveTag={tagManager.removeTag}
              onTagKeyPress={tagManager.handleTagInputKeyDown}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
