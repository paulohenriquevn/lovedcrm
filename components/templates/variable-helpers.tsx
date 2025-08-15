/**
 * Variable Helpers Component
 * Helper components for template variable insertion and management
 * Auto-completion and variable suggestion functionality
 */

'use client'

import { Code, Plus, Search, Variable } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AVAILABLE_VARIABLES, VARIABLE_DESCRIPTIONS } from '@/types/template'

import {
  useVariableSuggestions,
  useKeyboardNavigation,
  getVariableReplacement,
} from './variable-autocomplete-helpers'
import { VariableCard, VariableSelector } from './variable-helpers-components'

interface VariableInserterProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>
  onContentChange?: (content: string) => void
}

interface VariableAutoCompleteProps {
  content: string
  cursorPosition: number
  onVariableSelect: (variable: string) => void
  onClose: () => void
  visible: boolean
}

interface VariableLibraryProps {
  onVariableSelect: (variable: string) => void
  searchPlaceholder?: string
}

// Variable Library Component
export function VariableLibrary({
  onVariableSelect,
  searchPlaceholder = 'Buscar por nome ou descrição...',
}: VariableLibraryProps): React.ReactElement {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredVariables = AVAILABLE_VARIABLES.filter(
    variable =>
      variable.toLowerCase().includes(searchTerm.toLowerCase()) ||
      VARIABLE_DESCRIPTIONS[variable].toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleVariableClick = (variable: string): void => {
    onVariableSelect(`{{${variable}}}`)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Code className="h-4 w-4" />
          Biblioteca de Variáveis
        </CardTitle>
        <CardDescription>Todas as variáveis disponíveis para seus templates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-64">
          <div className="space-y-2 pr-4">
            {filteredVariables.map(variable => (
              <VariableCard key={variable} variable={variable} onClick={handleVariableClick} />
            ))}
          </div>

          {filteredVariables.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Variable className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma variável encontrada</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Variable Inserter Component
export function VariableInserter({
  textareaRef,
  onContentChange,
}: VariableInserterProps): React.ReactElement {
  const insertVariable = (variableText: string): void => {
    const textarea = textareaRef.current
    if (textarea === null) {
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentValue = textarea.value

    const newValue = currentValue.slice(0, start) + variableText + currentValue.slice(end)

    // Update the content
    onContentChange?.(newValue)

    // Set cursor position after inserted variable
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variableText.length, start + variableText.length)
    }, 0)
  }

  return (
    <div className="flex items-center gap-2">
      <VariableSelector
        onVariableSelect={insertVariable}
        triggerContent={
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Variável
          </Button>
        }
      />

      <Badge variant="outline" className="text-xs text-muted-foreground">
        Use {`{{variável}}`} para dados dinâmicos
      </Badge>
    </div>
  )
}

// Variable Auto Complete Component
function VariableAutoComplete({
  content,
  cursorPosition,
  onVariableSelect,
  onClose,
  visible,
}: VariableAutoCompleteProps): React.ReactElement | null {
  const suggestions = useVariableSuggestions({ content, cursorPosition, visible })
  const { selectedIndex, handleKeyDown } = useKeyboardNavigation({
    suggestions,
    onVariableSelect: (variable: string) => {
      const { newContent } = getVariableReplacement(content, cursorPosition, variable)
      onVariableSelect(newContent)
      onClose()
    },
    onClose,
  })

  const handleSelect = (variable: string): void => {
    const { newContent } = getVariableReplacement(content, cursorPosition, variable)
    onVariableSelect(newContent)
    onClose()
  }

  if (!visible || suggestions.length === 0) {
    return null
  }

  return (
    <Card
      className="absolute z-50 w-64 shadow-lg border"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="listbox"
    >
      <CardContent className="p-2">
        <div className="space-y-1">
          {suggestions.map((variable, index) => (
            <div
              key={variable}
              className={`p-2 rounded cursor-pointer text-sm ${
                index === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50'
              }`}
              onClick={() => handleSelect(variable)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSelect(variable)
                }
              }}
              role="option"
              aria-selected={index === selectedIndex}
              tabIndex={index === selectedIndex ? 0 : -1}
            >
              <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                {`{{${variable}}}`}
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                {VARIABLE_DESCRIPTIONS[variable]}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced Textarea with Auto-complete
interface SmartVariableTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SmartVariableTextarea({
  value,
  onChange,
  placeholder,
  className,
}: SmartVariableTextareaProps): React.ReactElement {
  const [showAutoComplete, setShowAutoComplete] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    const textarea = event.currentTarget
    setCursorPosition(textarea.selectionStart)

    // Show autocomplete when typing {{
    if (
      event.key === '{' &&
      textarea.value.slice(textarea.selectionStart - 1, textarea.selectionStart) === '{'
    ) {
      setShowAutoComplete(true)
    }

    // Hide autocomplete on specific keys
    if (['Escape', 'Enter', 'Tab'].includes(event.key)) {
      setShowAutoComplete(false)
    }
  }

  const handleVariableSelect = (newContent: string): void => {
    onChange(newContent)
    setShowAutoComplete(false)
  }

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        rows={6}
      />

      <VariableAutoComplete
        content={value}
        cursorPosition={cursorPosition}
        onVariableSelect={handleVariableSelect}
        onClose={() => setShowAutoComplete(false)}
        visible={showAutoComplete}
      />
    </div>
  )
}

// Export all components
export * from './variable-helpers-components'
