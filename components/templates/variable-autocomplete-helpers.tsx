/**
 * Variable AutoComplete Helpers
 * Helper functions and hooks extracted from VariableAutoComplete to reduce complexity
 */

import { useEffect, useState, useCallback } from 'react'

import { AVAILABLE_VARIABLES, type AvailableVariable } from '@/types/template'

interface UseVariableSuggestionsProps {
  content: string
  cursorPosition: number
  visible: boolean
}

interface UseKeyboardNavigationProps {
  suggestions: AvailableVariable[]
  onVariableSelect: (variable: string) => void
  onClose: () => void
}

export function useVariableSuggestions({
  content,
  cursorPosition,
  visible,
}: UseVariableSuggestionsProps): AvailableVariable[] {
  const [suggestions, setSuggestions] = useState<AvailableVariable[]>([])

  useEffect(() => {
    if (!visible) {
      setSuggestions([])
      return
    }

    // Check if we're in the middle of typing a variable
    const beforeCursor = content.slice(0, cursorPosition)
    const match = beforeCursor.match(/{{(\w*)$/)

    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (match !== null && match[1] !== undefined && match[1].length > 0) {
      const partial = match[1].toLowerCase()
      const filtered = AVAILABLE_VARIABLES.filter(variable =>
        variable.toLowerCase().startsWith(partial)
      )
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }, [content, cursorPosition, visible])

  return suggestions
}

export function useKeyboardNavigation({
  suggestions,
  onVariableSelect,
  onClose,
}: UseKeyboardNavigationProps): {
  selectedIndex: number
  handleKeyDown: (event: React.KeyboardEvent) => void
} {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIndex(0)
  }, [suggestions])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent): void => {
      if (suggestions.length === 0) {
        return
      }

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault()
          setSelectedIndex(prev => (prev + 1) % suggestions.length)
          break
        }
        case 'ArrowUp': {
          event.preventDefault()
          setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
          break
        }
        case 'Enter': {
          event.preventDefault()
          if (suggestions[selectedIndex]) {
            onVariableSelect(suggestions[selectedIndex])
          }
          break
        }
        case 'Escape': {
          event.preventDefault()
          onClose()
          break
        }
      }
    },
    [suggestions, selectedIndex, onVariableSelect, onClose]
  )

  return {
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
  }
}

export function getVariableReplacement(
  content: string,
  cursorPosition: number,
  variable: string
): {
  newContent: string
  newPosition: number
} {
  const beforeCursor = content.slice(0, cursorPosition)
  const afterCursor = content.slice(cursorPosition)
  const match = beforeCursor.match(/{{(\w*)$/)

  if (match !== null) {
    const matchStart = match.index ?? 0
    const beforeMatch = content.slice(0, matchStart)
    const variableText = `{{${variable}}}`
    const newContent = beforeMatch + variableText + afterCursor
    const newPosition = matchStart + variableText.length

    return { newContent, newPosition }
  }

  return { newContent: content, newPosition: cursorPosition }
}
