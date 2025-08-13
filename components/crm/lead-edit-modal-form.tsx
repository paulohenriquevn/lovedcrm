/**
 * Lead Edit Modal Form Component
 * Extracted form component to reduce main modal complexity
 */

'use client'

import { UseFormReturn } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

import { LeadEditFormFields } from './lead-edit-form-fields'
import { LeadEditForm } from './lead-edit-modal-utils'

interface LeadEditModalFormProps {
  form: UseFormReturn<LeadEditForm>
  isLoading: boolean
  currentTags: string[]
  tagInput: string
  onTagInputChange: (value: string) => void
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  onTagKeyPress: (e: React.KeyboardEvent) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function LeadEditModalForm({
  form,
  isLoading,
  currentTags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onTagKeyPress,
  onSubmit,
  onCancel,
}: LeadEditModalFormProps): React.ReactElement {
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <LeadEditFormFields
          form={form}
          isLoading={isLoading}
          currentTags={currentTags}
          tagInput={tagInput}
          onTagInputChange={onTagInputChange}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
          onTagKeyPress={onTagKeyPress}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
