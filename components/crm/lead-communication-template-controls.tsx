/**
 * Lead Communication Template Controls
 * Template selection header and context preview components
 */

import { Wand2, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  TEMPLATE_CATEGORY_ICONS,
  type MessageTemplate,
  type TemplateCategory,
} from '@/types/template'

import type { Lead } from '@/services/crm-leads'

interface TemplateControlsProps {
  showTemplates: boolean
  selectedTemplate: MessageTemplate | null
  onToggleTemplates: () => void
  onClearTemplate: () => void
}

interface LeadContextPreviewProps {
  selectedTemplate: MessageTemplate | null
  lead: Lead
  leadContext: Record<string, unknown>
}

export function TemplateControls({
  showTemplates,
  selectedTemplate,
  onToggleTemplates,
  onClearTemplate,
}: TemplateControlsProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant={showTemplates ? 'default' : 'outline'}
        size="sm"
        onClick={onToggleTemplates}
        className="text-sm"
      >
        <Wand2 className="h-4 w-4 mr-2" />
        {showTemplates ? 'Ocultar Templates' : 'Usar Template'}
      </Button>

      {selectedTemplate !== null && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <span className="mr-1">
              {TEMPLATE_CATEGORY_ICONS[selectedTemplate.category as TemplateCategory]}
            </span>
            {selectedTemplate.name}
          </Badge>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClearTemplate}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}

export function LeadContextPreview({
  selectedTemplate,
  lead,
  leadContext,
}: LeadContextPreviewProps): React.ReactElement | null {
  if (selectedTemplate === null) {
    return null
  }

  return (
    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
      <p className="text-xs text-blue-800 dark:text-blue-200 mb-1">
        Variáveis detectadas para {lead.name}:
      </p>
      <div className="flex flex-wrap gap-1">
        {Object.entries(leadContext).map(([key, value]) =>
          value !== null && value !== '' ? (
            <Badge key={key} variant="secondary" className="text-xs">
              {key}: {String(value)}
            </Badge>
          ) : null
        )}
      </div>
    </div>
  )
}
