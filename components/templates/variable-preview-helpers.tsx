/**
 * Variable Preview Helpers
 * Helper components and hooks extracted from VariablePreview to reduce complexity
 */

import { Eye, RefreshCw } from 'lucide-react'
import { useState, useCallback } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTemplateActions } from '@/hooks/use-templates'

import type { TemplateUseContext } from '@/types/template'

interface PreviewControlsProps {
  templateId?: string
  onServerPreview: () => void
  isLoadingPreview: boolean
}

interface ContextEditorProps {
  context: TemplateUseContext
  detectedVariables: string[]
  onContextChange: (context: TemplateUseContext) => void
}

interface PreviewContentProps {
  preview: string
  detectedVariables: string[]
}

export function PreviewControls({
  templateId,
  onServerPreview,
  isLoadingPreview,
}: PreviewControlsProps): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="text-xs">
        <Eye className="h-3 w-3 mr-1" />
        Preview
      </Badge>
      {templateId !== undefined && templateId.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onServerPreview}
          disabled={isLoadingPreview}
          className="text-xs"
        >
          {isLoadingPreview ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Carregando...
            </>
          ) : (
            'Preview do Servidor'
          )}
        </Button>
      )}
    </div>
  )
}

export function ContextEditor({
  context,
  detectedVariables,
  onContextChange,
}: ContextEditorProps): React.ReactElement {
  const handleContextUpdate = (key: string, value: string): void => {
    onContextChange({ ...context, [key]: value })
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {detectedVariables.map(variable => (
        <div key={variable} className="space-y-1">
          <Label htmlFor={`context-${variable}`} className="text-xs font-medium">
            {variable}
          </Label>
          <Input
            id={`context-${variable}`}
            value={context[variable] ?? ''}
            onChange={e => handleContextUpdate(variable, e.target.value)}
            placeholder={`Digite valor para ${variable}`}
            className="text-xs"
          />
        </div>
      ))}
    </div>
  )
}

export function PreviewContent({
  preview,
  detectedVariables,
}: PreviewContentProps): React.ReactElement {
  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">
        {detectedVariables.length > 0
          ? `${detectedVariables.length} variáveis detectadas`
          : 'Nenhuma variável detectada'}
      </div>
      <div className="p-3 bg-muted/30 rounded-md border text-sm">
        {preview || <span className="text-muted-foreground italic">Preview vazio</span>}
      </div>
    </div>
  )
}

export function useServerPreview(templateId?: string): {
  isLoadingPreview: boolean
  handleServerPreview: (context: TemplateUseContext) => Promise<string | null>
} {
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const { applyTemplate } = useTemplateActions()

  const handleServerPreview = useCallback(
    async (context: TemplateUseContext): Promise<string | null> => {
      if (templateId === undefined || templateId.length === 0) {
        return null
      }

      setIsLoadingPreview(true)
      try {
        const result = await applyTemplate(templateId, context)
        return result.rendered_content
      } catch (error) {
        // TODO: Show error toast instead of console.error
        // eslint-disable-next-line no-console
        console.error('Failed to get server preview:', error)
        return null
      } finally {
        setIsLoadingPreview(false)
      }
    },
    [templateId, applyTemplate]
  )

  return { handleServerPreview, isLoadingPreview }
}
