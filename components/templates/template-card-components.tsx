/**
 * Template Card Helper Components
 * Sub-components extracted from template-card.tsx for better maintainability
 */

import React from 'react'

import { QuickActions } from './template-action-buttons'
import { TemplateActionMenu } from './template-action-menu'

import type { MessageTemplate } from '@/types/template'

interface TemplateActionsProps {
  template: MessageTemplate
  copied: boolean
  onEdit?: (template: MessageTemplate) => void
  onDelete?: (template: MessageTemplate) => void
  onUse?: (template: MessageTemplate) => void
  onPreview?: (template: MessageTemplate) => void
  onToggleFavorite?: (template: MessageTemplate) => void
  onCopyContent: () => void
}

export function TemplateActions({
  template,
  copied,
  onEdit,
  onDelete,
  onUse,
  onPreview,
  onToggleFavorite,
  onCopyContent,
}: TemplateActionsProps): React.ReactElement {
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <QuickActions
        template={template}
        copied={copied}
        onUse={onUse}
        onPreview={onPreview}
        onCopyContent={onCopyContent}
      />

      <TemplateActionMenu
        template={template}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  )
}
