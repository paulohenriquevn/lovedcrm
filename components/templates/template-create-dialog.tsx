/**
 * Template Create Dialog Component
 * Dialog for creating new message templates
 * Follows pattern from crm components
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FileText } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { useTemplateActions } from '@/hooks/use-templates'
import { templateCreateSchema } from '@/schemas/template'
import { type TemplateFormData } from '@/types/template'

import { VariableHelper, AvailableVariables } from './template-create-dialog-components'
import { TemplateFormFields } from './template-form-fields'

interface TemplateCreateDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

function TemplateCreateForm({
  form,
  isLoading,
  onSubmit,
  onCancel,
}: {
  form: ReturnType<typeof useForm<TemplateFormData>>
  isLoading: boolean
  onSubmit: (data: TemplateFormData) => void
  onCancel: () => void
}): React.ReactElement {
  const contentValue = form.watch('content')

  return (
    <Form {...form}>
      <form
        onSubmit={e => {
          e.preventDefault()
          void form.handleSubmit(onSubmit)(e)
        }}
        className="space-y-4"
      >
        <TemplateFormFields control={form.control} isLoading={isLoading} />

        {/* Variable Helper */}
        {contentValue.length > 0 && <VariableHelper content={contentValue} />}

        {/* Available Variables */}
        <AvailableVariables />

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Criando...' : 'Criar Template'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export function TemplateCreateDialog({
  isOpen,
  onOpenChange,
  onSuccess,
}: TemplateCreateDialogProps): React.ReactElement {
  const { createTemplate, isLoading } = useTemplateActions()

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateCreateSchema),
    defaultValues: {
      name: '',
      category: 'greeting',
      content: '',
    },
  })

  const handleSubmit = async (data: TemplateFormData): Promise<void> => {
    try {
      await createTemplate(data)
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      // Error is handled by the hook
      // TODO: Show error toast instead of console.error
      // eslint-disable-next-line no-console
      console.error('Failed to create template:', error)
    }
  }

  const handleCancel = (): void => {
    form.reset()
    onOpenChange(false)
  }

  const handleFormSubmit = (data: TemplateFormData): void => {
    void handleSubmit(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Criar Template de Mensagem
          </DialogTitle>
          <DialogDescription>
            Crie um template reutilizável para acelerar sua comunicação com leads.
          </DialogDescription>
        </DialogHeader>

        <TemplateCreateForm
          form={form}
          isLoading={isLoading}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
}
