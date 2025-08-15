/**
 * Template Form Handlers
 * Custom hooks for template form handling logic
 */

import { useCallback } from 'react'
import { UseFormReturn } from 'react-hook-form'

import { useTemplateActions } from '@/hooks/use-templates'
import { type TemplateCategory } from '@/types/template'

interface TemplateFormData {
  name: string
  category: string
  content: string
}

interface UseCreateTemplateHandlersProps {
  form: UseFormReturn<TemplateFormData>
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface UseEditTemplateHandlersProps {
  templateId: string
  form: UseFormReturn<TemplateFormData>
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function useCreateTemplateHandlers({
  form,
  onOpenChange,
  onSuccess,
}: UseCreateTemplateHandlersProps): {
  handleSubmit: (data: TemplateFormData) => Promise<void>
  handleCancel: () => void
  isLoading: boolean
} {
  const { createTemplate, isLoading } = useTemplateActions()

  const handleSubmit = useCallback(
    async (data: TemplateFormData): Promise<void> => {
      try {
        await createTemplate({
          ...data,
          category: data.category as TemplateCategory,
        })
        form.reset()
        onOpenChange(false)
        onSuccess?.()
      } catch (error) {
        // Error is handled by the hook
        // TODO: Show error toast instead of console.error
        // eslint-disable-next-line no-console
        console.error('Failed to create template:', error)
      }
    },
    [createTemplate, form, onOpenChange, onSuccess]
  )

  const handleCancel = useCallback((): void => {
    form.reset()
    onOpenChange(false)
  }, [form, onOpenChange])

  const handleFormSubmit = useCallback(
    (data: TemplateFormData): void => {
      void handleSubmit(data)
    },
    [handleSubmit]
  )

  return {
    handleSubmit,
    handleCancel,
    handleFormSubmit,
    isLoading,
  }
}

export function useEditTemplateHandlers({
  templateId,
  form,
  onOpenChange,
  onSuccess,
}: UseEditTemplateHandlersProps): {
  handleSubmit: (data: TemplateFormData) => Promise<void>
  handleCancel: () => void
  handleFormSubmit: (data: TemplateFormData) => void
  isLoading: boolean
} {
  const { updateTemplate, isLoading } = useTemplateActions()

  const handleSubmit = useCallback(
    async (data: TemplateFormData): Promise<void> => {
      try {
        await updateTemplate(templateId, {
          ...data,
          category: data.category as TemplateCategory,
        })
        form.reset()
        onOpenChange(false)
        onSuccess?.()
      } catch (error) {
        // Error is handled by the hook
        // TODO: Show error toast instead of console.error
        // eslint-disable-next-line no-console
        console.error('Failed to update template:', error)
      }
    },
    [templateId, updateTemplate, form, onOpenChange, onSuccess]
  )

  const handleCancel = useCallback((): void => {
    form.reset()
    onOpenChange(false)
  }, [form, onOpenChange])

  const handleFormSubmit = useCallback(
    (data: TemplateFormData): void => {
      void handleSubmit(data)
    },
    [handleSubmit]
  )

  return {
    handleSubmit,
    handleCancel,
    handleFormSubmit,
    isLoading,
  }
}
