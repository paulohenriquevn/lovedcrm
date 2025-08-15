/**
 * Lead Communication Component
 * Message composition interface with template suggestions
 * Integrates with the template system for faster lead communication
 */

'use client'

import { MessageSquare } from 'lucide-react'
import { useState, useRef } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useTemplates } from '@/hooks/use-templates'
import { type MessageTemplate, type TemplateCategory } from '@/types/template'

import {
  TemplateSelectionPanel as TemplatePanel,
  MessageComposition,
} from './lead-communication-components'
import { useTemplateHandlers, useMessageHandlers } from './lead-communication-handlers'
import { TemplateControls, LeadContextPreview } from './lead-communication-template-controls'
import { createLeadContext } from './lead-communication-utils'

import type { Lead } from '@/services/crm-leads'

interface LeadCommunicationContentProps {
  lead: Lead
  message: string
  selectedCategory: TemplateCategory | 'all'
  selectedTemplate: MessageTemplate | null
  isSending: boolean
  showTemplates: boolean
  textareaRef: React.RefObject<HTMLTextAreaElement>
  templates: MessageTemplate[]
  templatesLoading: boolean
  filteredTemplates: MessageTemplate[]
  leadContext: Record<string, string | undefined>
  handleCategoryChange: (value: string) => void
  handleToggleTemplates: () => void
  handleClearTemplate: () => void
  handleTemplateUse: (template: MessageTemplate) => Promise<void>
  handleTemplatePreview: (template: MessageTemplate) => void
  setMessage: (message: string) => void
  handleSendClick: () => void
}

function LeadCommunicationContent({
  lead,
  message,
  selectedCategory,
  selectedTemplate,
  showTemplates,
  textareaRef,
  filteredTemplates,
  templatesLoading,
  leadContext,
  handleCategoryChange,
  handleToggleTemplates,
  handleClearTemplate,
  handleTemplateUse,
  handleTemplatePreview,
  setMessage,
  handleSendClick,
  isSending,
}: LeadCommunicationContentProps): React.ReactElement {
  return (
    <CardContent className="space-y-4">
      {/* Template Selection Header */}
      <TemplateControls
        showTemplates={showTemplates}
        selectedTemplate={selectedTemplate}
        onToggleTemplates={handleToggleTemplates}
        onClearTemplate={handleClearTemplate}
      />

      {/* Template Suggestions */}
      {showTemplates === true && (
        <TemplatePanel
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          filteredTemplates={filteredTemplates}
          templatesLoading={templatesLoading}
          onTemplateUse={(template: MessageTemplate) => {
            void handleTemplateUse(template)
          }}
          onTemplatePreview={handleTemplatePreview}
          selectedTemplate={selectedTemplate}
        />
      )}

      <Separator />

      {/* Message Composition */}
      <MessageComposition
        message={message}
        onMessageChange={setMessage}
        onSendMessage={handleSendClick}
        isSending={isSending}
        lead={lead}
        textareaRef={textareaRef}
      />

      {/* Lead Context Preview */}
      <LeadContextPreview
        selectedTemplate={selectedTemplate}
        lead={lead}
        leadContext={leadContext}
      />
    </CardContent>
  )
}

interface LeadCommunicationProps {
  lead: Lead
  onSendMessage?: (message: string, templateId?: string) => Promise<void>
  className?: string
}

export function LeadCommunication({
  lead,
  onSendMessage,
  className,
}: LeadCommunicationProps): React.ReactElement {
  const [message, setMessage] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Fetch templates
  const { templates, isLoading: templatesLoading } = useTemplates(
    selectedCategory === 'all' ? undefined : selectedCategory
  )

  // Generate lead context and filter templates
  const leadContext = createLeadContext(lead)
  const filteredTemplates =
    selectedCategory === 'all' ? templates : templates.filter(t => t.category === selectedCategory)

  // Template handlers
  const { handleTemplateUse, handleTemplatePreview, handleClearTemplate } = useTemplateHandlers({
    leadContext,
    setMessage,
    setSelectedTemplate,
    textareaRef,
  })

  // Message handlers
  const { handleSendClick } = useMessageHandlers({
    message,
    selectedTemplate,
    onSendMessage,
    setMessage,
    setSelectedTemplate,
    setShowTemplates,
    setIsSending,
  })

  const handleCategoryChange = (value: string): void =>
    setSelectedCategory(value as TemplateCategory | 'all')
  const handleToggleTemplates = (): void => setShowTemplates(!showTemplates)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Enviar Mensagem para {lead.name}
        </CardTitle>
        <CardDescription>
          Compose uma mensagem ou use um template para acelerar sua comunicação
        </CardDescription>
      </CardHeader>

      <LeadCommunicationContent
        lead={lead}
        message={message}
        selectedCategory={selectedCategory}
        selectedTemplate={selectedTemplate}
        isSending={isSending}
        showTemplates={showTemplates}
        textareaRef={textareaRef}
        templates={templates}
        templatesLoading={templatesLoading}
        filteredTemplates={filteredTemplates}
        leadContext={leadContext}
        handleCategoryChange={handleCategoryChange}
        handleToggleTemplates={handleToggleTemplates}
        handleClearTemplate={handleClearTemplate}
        handleTemplateUse={handleTemplateUse}
        handleTemplatePreview={handleTemplatePreview}
        setMessage={setMessage}
        handleSendClick={handleSendClick}
      />
    </Card>
  )
}
