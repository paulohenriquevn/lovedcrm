/**
 * Lead Communication Handlers
 * Extracted event handlers and business logic from LeadCommunication component
 */

import { useCallback } from 'react'

import { substituteVariables } from '@/components/templates/variable-preview'
import { useTemplateActions } from '@/hooks/use-templates'

import type { MessageTemplate, TemplateUseContext } from '@/types/template'

interface UseTemplateHandlersProps {
  leadContext: TemplateUseContext
  setMessage: (message: string) => void
  setSelectedTemplate: (template: MessageTemplate | null) => void
  textareaRef: React.RefObject<HTMLTextAreaElement>
}

interface UseMessageHandlersProps {
  message: string
  selectedTemplate: MessageTemplate | null
  onSendMessage?: (message: string, templateId?: string) => Promise<void>
  setMessage: (message: string) => void
  setSelectedTemplate: (template: MessageTemplate | null) => void
  setShowTemplates: (show: boolean) => void
  setIsSending: (sending: boolean) => void
}

export function useTemplateHandlers({
  leadContext,
  setMessage,
  setSelectedTemplate,
  textareaRef,
}: UseTemplateHandlersProps): {
  handleTemplateUse: (template: MessageTemplate) => Promise<void>
  handleTemplatePreview: (template: MessageTemplate) => void
  handleClearTemplate: () => void
} {
  const { applyTemplate } = useTemplateActions()

  const handleTemplateUse = useCallback(
    async (template: MessageTemplate): Promise<void> => {
      try {
        // Use server-side template processing if possible
        const result = await applyTemplate(template.id, leadContext)
        setMessage(result.rendered_content)
        setSelectedTemplate(template)
      } catch {
        // Fallback to client-side substitution
        const renderedContent = substituteVariables(template.content, leadContext)
        setMessage(renderedContent)
        setSelectedTemplate(template)
      }

      // Focus textarea
      textareaRef.current?.focus()
    },
    [applyTemplate, leadContext, setMessage, setSelectedTemplate, textareaRef]
  )

  const handleTemplatePreview = useCallback(
    (template: MessageTemplate): void => {
      const renderedContent = substituteVariables(template.content, leadContext)
      // TODO: Show a preview modal instead of console.log
      // eslint-disable-next-line no-console
      console.log('Preview:', renderedContent)
    },
    [leadContext]
  )

  const handleClearTemplate = useCallback((): void => {
    setSelectedTemplate(null)
    setMessage('')
  }, [setMessage, setSelectedTemplate])

  return {
    handleTemplateUse,
    handleTemplatePreview,
    handleClearTemplate,
  }
}

export function useMessageHandlers({
  message,
  selectedTemplate,
  onSendMessage,
  setMessage,
  setSelectedTemplate,
  setShowTemplates,
  setIsSending,
}: UseMessageHandlersProps): {
  handleSendMessage: () => Promise<void>
  handleSendClick: () => void
} {
  const handleSendMessage = useCallback(async (): Promise<void> => {
    if (message.trim().length === 0) {
      return
    }

    setIsSending(true)
    try {
      await onSendMessage?.(message, selectedTemplate?.id)
      setMessage('')
      setSelectedTemplate(null)
      setShowTemplates(false)
    } catch (error) {
      // TODO: Show error toast instead of console.error
      // eslint-disable-next-line no-console
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }, [
    message,
    selectedTemplate,
    onSendMessage,
    setMessage,
    setSelectedTemplate,
    setShowTemplates,
    setIsSending,
  ])

  const handleSendClick = useCallback((): void => {
    void handleSendMessage()
  }, [handleSendMessage])

  return {
    handleSendMessage,
    handleSendClick,
  }
}
