/**
 * Lead Communication Helper Components
 * Sub-components extracted from lead-communication.tsx
 */

import { Wand2, Filter, Send } from 'lucide-react'
import React from 'react'

import { VariableInserter } from '@/components/templates/variable-helpers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_CATEGORY_ICONS,
  type MessageTemplate,
  type TemplateCategory,
} from '@/types/template'

interface TemplateSuggestionProps {
  template: MessageTemplate
  onUse: (template: MessageTemplate) => void
  onPreview: (template: MessageTemplate) => void
  isSelected: boolean
}

interface TemplateSelectionPanelProps {
  selectedCategory: string
  onCategoryChange: (value: string) => void
  filteredTemplates: MessageTemplate[]
  templatesLoading: boolean
  onTemplateUse: (template: MessageTemplate) => void
  onTemplatePreview: (template: MessageTemplate) => void
  selectedTemplate?: MessageTemplate | null
}

export function TemplateSelectionPanel({
  selectedCategory,
  onCategoryChange,
  filteredTemplates,
  templatesLoading,
  onTemplateUse,
  onTemplatePreview,
  selectedTemplate,
}: TemplateSelectionPanelProps): React.ReactElement {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {Object.entries(TEMPLATE_CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    <span>{TEMPLATE_CATEGORY_ICONS[value as TemplateCategory]}</span>
                    <span>{label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Templates List */}
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {templatesLoading ? (
              <div className="text-sm text-muted-foreground">Carregando templates...</div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-sm text-muted-foreground">Nenhum template encontrado</div>
            ) : (
              filteredTemplates.map(template => (
                <TemplateSuggestion
                  key={template.id}
                  template={template}
                  onUse={onTemplateUse}
                  onPreview={onTemplatePreview}
                  isSelected={selectedTemplate?.id === template.id}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export function TemplateSuggestion({
  template,
  onUse,
  onPreview,
  isSelected,
}: TemplateSuggestionProps): React.ReactElement {
  const categoryIcon = TEMPLATE_CATEGORY_ICONS[template.category as TemplateCategory] || '📝'
  const categoryLabel =
    TEMPLATE_CATEGORY_LABELS[template.category as TemplateCategory] || template.category

  const handleUse = (): void => {
    onUse(template)
  }

  const handlePreview = (e: React.MouseEvent): void => {
    e.stopPropagation()
    onPreview(template)
  }

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-sm ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
      onClick={handleUse}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm">{categoryIcon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{template.name}</p>
              <p className="text-xs text-muted-foreground">{categoryLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 ml-2">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handlePreview}>
              <Wand2 className="h-3 w-3" />
            </Button>

            <Badge variant="outline" className="text-xs">
              {template.usage_count}x
            </Badge>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {template.content.length > 80 ? `${template.content.slice(0, 80)}...` : template.content}
        </p>
      </CardContent>
    </Card>
  )
}

interface MessageCompositionProps {
  message: string
  onMessageChange: (message: string) => void
  onSendMessage: () => void
  isSending: boolean
  lead: { name: string }
  textareaRef: React.RefObject<HTMLTextAreaElement>
}

export function MessageComposition({
  message,
  onMessageChange,
  onSendMessage,
  isSending,
  lead,
  textareaRef,
}: MessageCompositionProps): React.ReactElement {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="message-textarea" className="text-sm font-medium">
          Mensagem
        </label>
        <VariableInserter textareaRef={textareaRef} onContentChange={onMessageChange} />
      </div>

      <Textarea
        id="message-textarea"
        ref={textareaRef}
        placeholder={`Olá ${lead.name}, espero que esteja bem!

Como posso ajudá-lo hoje?`}
        value={message}
        onChange={e => onMessageChange(e.target.value)}
        className="min-h-[120px] resize-none"
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{message.length} / 1000 caracteres</p>

        <Button onClick={onSendMessage} disabled={!message.trim() || isSending} size="sm">
          <Send className="h-4 w-4 mr-2" />
          {isSending ? 'Enviando...' : 'Enviar Mensagem'}
        </Button>
      </div>
    </div>
  )
}
