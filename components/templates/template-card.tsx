/**
 * Template Card Component
 *
 * Displays template information with actions.
 * Used in the templates grid view for management interface.
 *
 * @component
 * @example
 * ```tsx
 * <TemplateCard
 *   template={messageTemplate}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onToggleStatus={handleToggle}
 * />
 * ```
 */

'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

import { TemplateActions } from './template-card-components'
import {
  TemplateHeader,
  TemplateContent,
  TemplateMeta,
  QuickUseButton,
  useCopyContent,
  useCardInteraction,
} from './template-card-helpers'

import type { MessageTemplate } from '@/types/template'

interface TemplateCardProps {
  template: MessageTemplate
  onEdit?: (template: MessageTemplate) => void
  onDelete?: (template: MessageTemplate) => void
  onUse?: (template: MessageTemplate) => void
  onPreview?: (template: MessageTemplate) => void
  onToggleFavorite?: (template: MessageTemplate) => void
}

export function TemplateCard({
  template,
  onEdit,
  onDelete,
  onUse,
  onPreview,
  onToggleFavorite,
}: TemplateCardProps): React.ReactElement {
  const { copied, handleCopyContent } = useCopyContent()
  const { handleCardClick, handleCardKeyDown } = useCardInteraction(onPreview)

  return (
    <Card
      className="group hover:shadow-md transition-all duration-200 relative cursor-pointer"
      onClick={() => handleCardClick(template)}
      onKeyDown={e => handleCardKeyDown(e, template)}
      tabIndex={0}
      role="button"
      aria-label={`Preview template: ${template.name}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <TemplateHeader template={template} />

          <div
            onClick={e => e.stopPropagation()}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation()
              }
            }}
            role="button"
            tabIndex={0}
          >
            <TemplateActions
              template={template}
              copied={copied}
              onEdit={onEdit}
              onDelete={onDelete}
              onUse={onUse}
              onPreview={onPreview}
              onToggleFavorite={onToggleFavorite}
              onCopyContent={() => {
                void handleCopyContent(template.content)
              }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <TemplateContent template={template} />
        <TemplateMeta template={template} />
        <QuickUseButton template={template} onUse={onUse} />
      </CardContent>
    </Card>
  )
}
