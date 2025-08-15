/**
 * Template Create Dialog Helper Components
 * Sub-components extracted from template-create-dialog.tsx
 */

import { Eye, EyeOff } from 'lucide-react'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AVAILABLE_VARIABLES, VARIABLE_DESCRIPTIONS } from '@/types/template'

interface VariableHelperProps {
  content: string
}

export function VariableHelper({ content }: VariableHelperProps): React.ReactElement | null {
  const detectedVariables = AVAILABLE_VARIABLES.filter(variable =>
    content.includes(`{{${variable}}}`)
  )

  if (detectedVariables.length === 0) {
    return null
  }

  return (
    <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-blue-800 dark:text-blue-200">
          Variáveis Detectadas
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1">
          {detectedVariables.map(variable => (
            <Badge
              key={variable}
              variant="secondary"
              className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {`{{${variable}}}`}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function AvailableVariables(): React.ReactElement {
  const [showVariables, setShowVariables] = useState(false)

  const toggleVariables = (): void => {
    setShowVariables(!showVariables)
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={toggleVariables}
        className="h-8 text-xs"
      >
        {showVariables ? (
          <>
            <EyeOff className="h-3 w-3 mr-1" />
            Ocultar variáveis
          </>
        ) : (
          <>
            <Eye className="h-3 w-3 mr-1" />
            Ver variáveis disponíveis
          </>
        )}
      </Button>

      {showVariables === true && (
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Variáveis Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {AVAILABLE_VARIABLES.map(variable => (
                <div key={variable} className="flex items-center gap-2">
                  <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">
                    {`{{${variable}}}`}
                  </code>
                  <span className="text-muted-foreground">{VARIABLE_DESCRIPTIONS[variable]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
