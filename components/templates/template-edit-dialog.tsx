/**
 * Template Edit Dialog Component
 * Dialog for editing existing message templates
 * Follows pattern from template-create-dialog.tsx
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FileText } from 'lucide-react'
import { useForm } from 'react-hook-form'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { useTemplateActions } from '@/hooks/use-templates'
import { templateUpdateSchema } from '@/schemas/template'
import { type MessageTemplate, type TemplateUpdateData } from '@/types/template'

import { VariableHelper, AvailableVariables } from './template-create-dialog-components'
import {
  TemplateFormFields,
  TemplateStatusSection,
  TemplateActionButtons,
  useTemplateEditHandlers,
} from './template-edit-dialog-components'

interface TemplateEditDialogProps {
  template: MessageTemplate | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function TemplateEditDialog({
  template,
  isOpen,
  onOpenChange,
  onSuccess,
}: TemplateEditDialogProps): React.ReactElement {
  const { updateTemplate, isLoading } = useTemplateActions()

  const form = useForm<TemplateUpdateData>({
    resolver: zodResolver(templateUpdateSchema),
    defaultValues: {
      name: '',
      category: 'greeting',
      content: '',
      is_active: true,
    },
  })

  const { contentValue, handleCancel, handleFormSubmit } = useTemplateEditHandlers({
    form,
    template,
    updateTemplate,
    isLoading,
    onOpenChange,
    onSuccess,
  })

  if (template === null) {
    return <div>Template not found</div>
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Editar Template: {template.name}
          </DialogTitle>
          <DialogDescription>
            Edite as informações do template para melhorar sua comunicação com leads.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <TemplateFormFields
              control={form.control}
              isLoading={isLoading}
              contentValue={contentValue}
            />

            {/* Variable Helper */}
            {contentValue !== null && contentValue.length > 0 && (
              <VariableHelper content={contentValue} />
            )}

            {/* Template Status Section */}
            <TemplateStatusSection
              template={template}
              control={form.control}
              isLoading={isLoading}
            />

            {/* Available Variables */}
            <AvailableVariables />

            {/* Action Buttons */}
            <TemplateActionButtons isLoading={isLoading} onCancel={handleCancel} />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
