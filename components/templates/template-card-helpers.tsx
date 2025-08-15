/**
 * Template Card Helpers
 * Helper components and hooks extracted from TemplateCard
 */

import { useState, useCallback } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardDescription, CardTitle } from '@/components/ui/card'
import {
  TEMPLATE_CATEGORY_ICONS,
  TEMPLATE_CATEGORY_LABELS,
  type MessageTemplate,
  type TemplateCategory,
} from '@/types/template'

interface TemplateHeaderProps {
  template: MessageTemplate
}

interface TemplateContentProps {
  template: MessageTemplate
}

interface TemplateMetaProps {
  template: MessageTemplate
}

interface QuickUseButtonProps {
  template: MessageTemplate
  onUse?: (template: MessageTemplate) => void
}

export function TemplateHeader({ template }: TemplateHeaderProps): React.ReactElement {
  const categoryIcon = TEMPLATE_CATEGORY_ICONS[template.category as TemplateCategory] || '📝'
  const categoryLabel =
    TEMPLATE_CATEGORY_LABELS[template.category as TemplateCategory] || template.category

  return (
    <div className="flex items-center gap-2 flex-1">
      <span className="text-lg">{categoryIcon}</span>
      <div className="flex-1 min-w-0">
        <CardTitle className="text-sm font-medium truncate">{template.name}</CardTitle>
        <CardDescription className="text-xs">{categoryLabel}</CardDescription>
      </div>
    </div>
  )
}

export function TemplateContent({ template }: TemplateContentProps): React.ReactElement {
  const truncatedContent =
    template.content.length > 120 ? `${template.content.slice(0, 120)}...` : template.content

  return (
    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{truncatedContent}</p>
  )
}

export function TemplateMeta({ template }: TemplateMetaProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Badge variant={template.is_active ? 'default' : 'secondary'} className="text-xs">
          {template.is_active ? 'Ativo' : 'Inativo'}
        </Badge>

        {template.is_favorite === true && (
          <Badge variant="outline" className="text-xs">
            ⭐ Favorito
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{template.variables.length} variáveis</span>
        <span>•</span>
        <span>Usado {template.usage_count}x</span>
      </div>
    </div>
  )
}

export function useCopyContent(): {
  copied: boolean
  handleCopyContent: (content: string) => Promise<void>
} {
  const [copied, setCopied] = useState(false)

  const handleCopyContent = useCallback(async (content: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // TODO: Show error toast instead of console.error
      // eslint-disable-next-line no-console
      console.error('Failed to copy template content:', error)
    }
  }, [])

  return { copied, handleCopyContent }
}

export function useCardInteraction(onPreview?: (template: MessageTemplate) => void): {
  handleCardClick: (template: MessageTemplate) => void
  handleCardKeyDown: (event: React.KeyboardEvent, template: MessageTemplate) => void
} {
  const handleCardClick = useCallback(
    (template: MessageTemplate): void => {
      onPreview?.(template)
    },
    [onPreview]
  )

  const handleCardKeyDown = useCallback(
    (event: React.KeyboardEvent, template: MessageTemplate): void => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onPreview?.(template)
      }
    },
    [onPreview]
  )

  return { handleCardClick, handleCardKeyDown }
}

export function QuickUseButton({
  template,
  onUse,
}: QuickUseButtonProps): React.ReactElement | null {
  if (!onUse) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      onClick={e => {
        e.stopPropagation()
        onUse(template)
      }}
    >
      Usar Template
    </Button>
  )
}
