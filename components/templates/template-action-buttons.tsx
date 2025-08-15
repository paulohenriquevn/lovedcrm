/**
 * Template Action Buttons
 * Individual action buttons extracted from TemplateActions
 */

import { Copy, Eye, Play } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import type { MessageTemplate } from '@/types/template'

interface ActionButtonProps {
  template: MessageTemplate
  onAction: (template: MessageTemplate) => void
  icon: React.ReactNode
  tooltip: string
  className?: string
}

interface QuickActionsProps {
  template: MessageTemplate
  copied: boolean
  onUse?: (template: MessageTemplate) => void
  onPreview?: (template: MessageTemplate) => void
  onCopyContent: () => void
}

function ActionButton({
  template,
  onAction,
  icon,
  tooltip,
  className,
}: ActionButtonProps): React.ReactElement {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${className ?? ''}`}
          onClick={() => onAction(template)}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export function QuickActions({
  template,
  copied,
  onUse,
  onPreview,
  onCopyContent,
}: QuickActionsProps): React.ReactElement {
  return (
    <TooltipProvider>
      {/* Use Template Button */}
      {onUse !== null && onUse !== undefined && (
        <ActionButton
          template={template}
          onAction={onUse}
          icon={<Play className="h-3 w-3" />}
          tooltip="Usar template"
        />
      )}

      {/* Preview Button */}
      {onPreview !== null && onPreview !== undefined && (
        <ActionButton
          template={template}
          onAction={onPreview}
          icon={<Eye className="h-3 w-3" />}
          tooltip="Visualizar"
        />
      )}

      {/* Copy Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onCopyContent}>
            <Copy className={`h-3 w-3 ${copied ? 'text-green-500' : ''}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? 'Copiado!' : 'Copiar conteúdo'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
