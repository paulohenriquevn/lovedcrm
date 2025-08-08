/**
 * Lead Create Form Fields - Form fields extracted from LeadCreateModal
 * Separated to reduce component complexity and improve maintainability
 */

'use client'

import { UseFormReturn } from 'react-hook-form'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PipelineStage } from '@/services/crm-leads'

import {
  ContactFields,
  EstimatedValueField,
  NotesField,
  StageSourceFields,
  TagsField
} from './lead-form-components'

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

interface LeadCreateFormFieldsProps {
  form: UseFormReturn<LeadCreateForm>
  isLoading: boolean
  currentTags: string[]
  tagInput: string
  onTagInputChange: (value: string) => void
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  onTagKeyPress: (e: React.KeyboardEvent) => void
}

export function LeadCreateFormFields({
  form,
  isLoading,
  currentTags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onTagKeyPress
}: LeadCreateFormFieldsProps): React.ReactElement {
  return (
    <div className="space-y-4">
      {/* Nome (obrigatório) */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome *</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Nome do lead"
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Email e Telefone */}
      <ContactFields form={form} isLoading={isLoading} />

      {/* Estágio e Origem */}
      <StageSourceFields form={form} isLoading={isLoading} />

      {/* Valor estimado */}
      <EstimatedValueField form={form} isLoading={isLoading} />

      {/* Tags */}
      <TagsField
        currentTags={currentTags}
        tagInput={tagInput}
        isLoading={isLoading}
        onTagInputChange={onTagInputChange}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
        onTagKeyPress={onTagKeyPress}
      />

      {/* Observações */}
      <NotesField form={form} isLoading={isLoading} />
    </div>
  )
}