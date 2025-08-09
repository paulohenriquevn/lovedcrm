/**
 * MultiSelect Helper Components
 * Extracted to reduce main component complexity
 */

import * as React from 'react'

import { type MultiSelectOption } from './multi-select'

interface TriggerButtonProps {
  open: boolean
  selectedOptions: MultiSelectOption[]
  maxCount: number
  placeholder: string
  onToggle: () => void
  onUnselect: (value: string) => void
}

export function TriggerButton({
  open: _open,
  selectedOptions,
  maxCount,
  placeholder,
  onToggle,
  onUnselect,
}: TriggerButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      className="flex h-10 sm:h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation"
      onClick={onToggle}
    >
      <span className="flex-1 text-left">
        {selectedOptions.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedOptions.slice(0, maxCount).map(option => (
              <span
                key={option.value}
                className="inline-flex items-center bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs"
              >
                {option.label}
                <button
                  type="button"
                  className="ml-1 hover:text-destructive"
                  onClick={e => {
                    e.stopPropagation()
                    onUnselect(option.value)
                  }}
                >
                  ×
                </button>
              </span>
            ))}
            {selectedOptions.length > maxCount && (
              <span className="text-xs text-muted-foreground">
                +{selectedOptions.length - maxCount} mais
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </span>
      <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

interface DropdownContentProps {
  open: boolean
  options: MultiSelectOption[]
  selected: string[]
  onSelect: (value: string) => void
}

export function DropdownContent({
  open,
  options,
  selected,
  onSelect,
}: DropdownContentProps): React.ReactElement | null {
  if (!open) {
    return null
  }

  if (options.length === 0) {
    return null
  }

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[150px] sm:max-h-[200px] overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
      {/* Search input */}
      <div className="p-2 border-b border-border">
        <input
          type="text"
          placeholder="Buscar..."
          className="w-full px-2 py-1 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          onChange={e => {
            // TODO: Implement search functionality if needed
            void e.target.value // Prevent unused parameter warning
          }}
        />
      </div>

      {options.length === 0 ? (
        <div className="p-2 text-sm text-muted-foreground">Nenhuma opção disponível</div>
      ) : (
        options.map(option => {
          const isSelected = selected.includes(option.value)
          return (
            <div
              key={option.value}
              role="button"
              tabIndex={0}
              className={`flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground text-popover-foreground ${
                isSelected ? 'bg-accent/50' : ''
              }`}
              onClick={() => onSelect(option.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect(option.value)
                }
              }}
            >
              <div className="mr-2 h-4 w-4 flex items-center justify-center">
                {isSelected ? (
                  <svg
                    className="h-4 w-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : null}
              </div>
              {option.label}
            </div>
          )
        })
      )}
    </div>
  )
}
