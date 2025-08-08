/**
 * Lead Create Modal - Modal para criação de leads (Refactored)
 * Simplified modal with extracted components for better maintainability
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { PipelineStage } from '@/services/crm-leads'

import { LeadCreateFormFields } from './lead-create-form-fields'
import { useLeadCreateLogic } from './lead-create-logic'

interface LeadCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialStage?: PipelineStage
}

const leadCreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().max(50, 'Telefone muito longo').optional().or(z.literal('')),
  stage: z.nativeEnum(PipelineStage),
  source: z.string().max(100, 'Source muito longo').optional().or(z.literal('')),
  estimatedValue: z.coerce.number().min(0, 'Valor deve ser positivo').optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional().or(z.literal(''))
})

type LeadCreateForm = z.infer<typeof leadCreateSchema>

interface ModalLogicReturn {
  isLoading: boolean
  currentTags: string[]
  tagInput: string
  setTagInput: (value: string) => void
  handleClose: () => void
  addTag: (tag: string) => void
  removeTag: (tagToRemove: string) => void
  handleTagKeyPress: (e: React.KeyboardEvent) => void
  handleFormSubmit: (e: React.FormEvent) => void
}

function useLeadCreateModalLogic(
  form: ReturnType<typeof useForm<LeadCreateForm>>,
  onClose: () => void,
  onSuccess: () => void
): ModalLogicReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const handleClose = (): void => {
    form.reset()
    setCurrentTags([])
    setTagInput('')
    onClose()
  }

  const { handleSubmit } = useLeadCreateLogic({
    currentTags,
    onClose: handleClose,
    onSuccess
  })

  const addTag = (tag: string): void => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !currentTags.includes(trimmedTag)) {
      const newTags = [...currentTags, trimmedTag]
      setCurrentTags(newTags)
      form.setValue('tags', newTags)
    }
    setTagInput('')
  }

  const removeTag = (tagToRemove: string): void => {
    const newTags = currentTags.filter(tag => tag !== tagToRemove)
    setCurrentTags(newTags)
    form.setValue('tags', newTags)
  }

  const handleTagKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (tagInput.trim()) {
        addTag(tagInput)
      }
    }
  }

  const handleFormSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    void form.handleSubmit((data: LeadCreateForm) => handleSubmit(data, setIsLoading))(e)
  }

  return {
    isLoading,
    currentTags,
    tagInput,
    setTagInput,
    handleClose,
    addTag,
    removeTag,
    handleTagKeyPress,
    handleFormSubmit
  }
}

export function LeadCreateModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialStage = PipelineStage.LEAD 
}: LeadCreateModalProps): React.ReactElement {
  const form = useForm<LeadCreateForm>({
    resolver: zodResolver(leadCreateSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      stage: initialStage,
      source: 'Website',
      estimatedValue: undefined,
      tags: [],
      notes: ''
    }
  })

  const {
    isLoading,
    currentTags,
    tagInput,
    setTagInput,
    handleClose,
    addTag,
    removeTag,
    handleTagKeyPress,
    handleFormSubmit
  } = useLeadCreateModalLogic(form, onClose, onSuccess)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Lead</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <LeadCreateFormFields
              form={form}
              isLoading={isLoading}
              currentTags={currentTags}
              tagInput={tagInput}
              onTagInputChange={setTagInput}
              onAddTag={addTag}
              onRemoveTag={removeTag}
              onTagKeyPress={handleTagKeyPress}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Criando...' : 'Criar Lead'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}