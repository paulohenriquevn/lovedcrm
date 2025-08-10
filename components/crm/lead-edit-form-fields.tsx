/**
 * Lead Edit Form Fields - Form fields extracted from LeadEditModal
 * Separated to reduce component complexity and improve maintainability
 */

'use client'

import { UseFormReturn } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PipelineStage } from '@/services/crm-leads'

import {
  ContactFields,
  EstimatedValueField,
  NotesField,
  StageSourceFields,
  TagsField,
} from './lead-form-components'

interface LeadEditForm {
  name: string
  email?: string
  phone?: string
  stage: PipelineStage
  source?: string
  estimatedValue?: number
  tags?: string[]
  notes?: string
  isFavorite?: boolean
}

interface LeadEditFormFieldsProps {
  form: UseFormReturn<LeadEditForm>
  isLoading: boolean
  currentTags: string[]
  tagInput: string
  onTagInputChange: (value: string) => void
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  onTagKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export function LeadEditFormFields({
  form,
  isLoading,
  currentTags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onTagKeyPress,
}: LeadEditFormFieldsProps): React.ReactElement {
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
              <Input {...field} placeholder="Nome do lead" disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Email e Telefone */}
      <ContactFields form={form} isLoading={isLoading} />

      {/* Estágio e Origem */}
      <StageSourceFields form={form} isLoading={isLoading} />

      {/* Valor estimado e Favorito */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EstimatedValueField form={form} isLoading={isLoading} />

        <FormField
          control={form.control}
          name="isFavorite"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 space-y-0 pt-8">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={e => field.onChange(e.target.checked)}
                  disabled={isLoading}
                  className="rounded"
                />
              </FormControl>
              <FormLabel className="!mt-0">Marcar como favorito</FormLabel>
            </FormItem>
          )}
        />
      </div>

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
