/**
 * Variable Preview Component
 * Shows real-time preview of template with substituted variables
 * Implements variable substitution UI for template editing
 */

'use client'

import { RefreshCw, Wand2 } from 'lucide-react'
import { useState, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useTemplateActions } from '@/hooks/use-templates'
import { type TemplateUseContext } from '@/types/template'

import { VariableEditor, PreviewPane } from './variable-preview-components'

interface VariablePreviewProps {
  content: string
  onVariableClick?: (variable: string) => void
  showPreview?: boolean
  templateId?: string
}

const DEFAULT_CONTEXT: TemplateUseContext = {
  // eslint-disable-next-line camelcase
  lead_name: 'João Silva',
  company: 'Tech Solutions Ltda',
  value: 'R$ 25.000',
  phone: '(11) 99999-9999',
  email: 'joao@techsolutions.com',
  source: 'LinkedIn',
  // eslint-disable-next-line camelcase
  user_name: 'Maria Santos',
  // eslint-disable-next-line camelcase
  user_title: 'Consultora de Vendas',
  organization: 'LovedCRM',
  // eslint-disable-next-line camelcase
  current_date: new Date().toLocaleDateString('pt-BR'),
  // eslint-disable-next-line camelcase
  current_time: new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }),
}

export function detectVariables(content: string): string[] {
  const pattern = /{{(\w+)}}/g
  const matches: string[] = []
  let match
  // eslint-disable-next-line no-cond-assign
  while ((match = pattern.exec(content)) !== null) {
    if (match[1] !== undefined && match[1].length > 0 && !matches.includes(match[1])) {
      matches.push(match[1])
    }
  }
  return matches
}

export function substituteVariables(content: string, context: TemplateUseContext): string {
  let result = content
  Object.entries(context).forEach(([key, value]) => {
    if (value !== null && value !== '') {
      const placeholder = `{{${key}}}`
      result = result.replaceAll(
        new RegExp(placeholder.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&'), 'g'),
        String(value)
      )
    }
  })
  return result
}

export function VariablePreview({
  content,
  showPreview = true,
  templateId,
}: VariablePreviewProps): React.ReactElement | null {
  const [context, setContext] = useState<TemplateUseContext>(DEFAULT_CONTEXT)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const { applyTemplate } = useTemplateActions()

  // Detect variables in content
  const detectedVariables = useMemo(() => detectVariables(content), [content])

  // Generate preview with client-side substitution
  const clientPreview = useMemo(() => {
    return substituteVariables(content, context)
  }, [content, context])

  // Server-side preview (if templateId is provided)
  const handleServerPreview = async (): Promise<void> => {
    if (templateId === undefined || templateId.length === 0) {
      return
    }

    setIsLoadingPreview(true)
    try {
      const result = await applyTemplate(templateId, context)
      // TODO: Show server preview result in UI instead of console
      // eslint-disable-next-line no-console
      console.log('Server preview result:', result.rendered_content)
    } catch (error) {
      // TODO: Show error toast instead of console.error
      // eslint-disable-next-line no-console
      console.error('Failed to generate server preview:', error)
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const handleResetToDefaults = (): void => setContext(DEFAULT_CONTEXT)

  if (!showPreview) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          Preview com Variáveis
        </CardTitle>
        <CardDescription>Visualize como o template ficará com dados reais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Variable Editor */}
        <VariableEditor
          variables={detectedVariables}
          context={context}
          onContextChange={setContext}
        />

        <Separator />

        {/* Preview Pane */}
        <PreviewPane
          originalContent={content}
          previewContent={clientPreview}
          isLoading={isLoadingPreview}
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" onClick={handleResetToDefaults} className="text-xs">
            <RefreshCw className="h-3 w-3 mr-1" />
            Resetar Valores
          </Button>

          {templateId !== null && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleServerPreview()}
              disabled={isLoadingPreview}
              className="text-xs"
            >
              <Wand2 className="h-3 w-3 mr-1" />
              {isLoadingPreview ? 'Processando...' : 'Preview Servidor'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
