/**
 * Variable Preview Helper Components
 * Sub-components for variable preview functionality
 */

import { Eye, EyeOff, RefreshCw, Wand2 } from 'lucide-react'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  AVAILABLE_VARIABLES,
  VARIABLE_DESCRIPTIONS,
  type TemplateUseContext,
  type AvailableVariable,
} from '@/types/template'

interface VariableEditorProps {
  variables: string[]
  context: TemplateUseContext
  onContextChange: (context: TemplateUseContext) => void
}

export function VariableEditor({
  variables,
  context,
  onContextChange,
}: VariableEditorProps): React.ReactElement {
  const handleVariableChange = (variable: string, value: string): void => {
    onContextChange({
      ...context,
      [variable]: value || '',
    })
  }

  const availableVariables = variables.filter(v =>
    AVAILABLE_VARIABLES.includes(v as AvailableVariable)
  )
  const unknownVariables = variables.filter(
    v => !AVAILABLE_VARIABLES.includes(v as AvailableVariable)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Variáveis Detectadas</Label>
        <Badge variant="outline" className="text-xs">
          {variables.length} variáveis
        </Badge>
      </div>

      <ScrollArea className="h-48">
        <div className="space-y-3 pr-4">
          {availableVariables.map(variable => (
            <div key={variable} className="space-y-1">
              <Label htmlFor={variable} className="text-xs text-muted-foreground">
                {`{{${variable}}}`} - {VARIABLE_DESCRIPTIONS[variable as AvailableVariable]}
              </Label>
              <Input
                id={variable}
                value={String(context[variable as keyof TemplateUseContext] ?? '')}
                onChange={e => handleVariableChange(variable, e.target.value)}
                placeholder={`Valor para ${variable}`}
                className="text-sm"
              />
            </div>
          ))}

          {unknownVariables.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs text-amber-600">Variáveis Personalizadas</Label>
                {unknownVariables.map(variable => (
                  <div key={variable} className="space-y-1">
                    <Label htmlFor={variable} className="text-xs text-muted-foreground">
                      {`{{${variable}}}`} - Variável personalizada
                    </Label>
                    <Input
                      id={variable}
                      value={String(context[variable as keyof TemplateUseContext] ?? '')}
                      onChange={e => handleVariableChange(variable, e.target.value)}
                      placeholder={`Valor para ${variable}`}
                      className="text-sm border-amber-200"
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {variables.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Nenhuma variável detectada no template
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface PreviewPaneProps {
  originalContent: string
  previewContent: string
  isLoading?: boolean
}

export function PreviewPane({
  originalContent,
  previewContent,
  isLoading,
}: PreviewPaneProps): React.ReactElement {
  const [showOriginal, setShowOriginal] = useState(false)

  const toggleView = (): void => {
    setShowOriginal(!showOriginal)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {showOriginal ? 'Conteúdo Original' : 'Preview com Variáveis'}
        </Label>
        <Button variant="ghost" size="sm" onClick={toggleView} className="h-8 text-xs">
          {showOriginal ? (
            <>
              <Eye className="h-3 w-3 mr-1" />
              Ver Preview
            </>
          ) : (
            <>
              <EyeOff className="h-3 w-3 mr-1" />
              Ver Original
            </>
          )}
        </Button>
      </div>

      <Card className={`${showOriginal ? 'border-muted' : 'border-primary/20 bg-primary/5'}`}>
        <CardContent className="pt-4">
          {isLoading === true ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processando...</span>
            </div>
          ) : (
            <div className="relative">
              <Textarea
                value={showOriginal ? originalContent : previewContent}
                readOnly
                className="min-h-[120px] resize-none border-0 p-0 focus-visible:ring-0"
                style={{ background: 'transparent' }}
              />
              {!showOriginal && previewContent !== originalContent && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    <Wand2 className="h-3 w-3 mr-1" />
                    Processado
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
