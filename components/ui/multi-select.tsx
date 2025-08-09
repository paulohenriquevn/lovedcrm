'use client'

import * as React from 'react'

// Simplified version without Popover - imports removed to avoid unused warnings
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
// import { MultiSelectTrigger, OptionList } from './multi-select-components'

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
  maxCount?: number
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Selecionar itens...',
  className: _className, // Unused but required for interface
  maxCount = 3,
}: MultiSelectProps): React.ReactElement {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = React.useCallback(
    (value: string) => {
      onChange(selected.filter(item => item !== value))
    },
    [selected, onChange]
  )

  const handleSelect = React.useCallback(
    (value: string) => {
      if (selected.includes(value)) {
        onChange(selected.filter(item => item !== value))
      } else {
        onChange([...selected, value])
      }
      // Fechar o dropdown após seleção
      setOpen(false)
    },
    [selected, onChange]
  )

  const handleToggle = React.useCallback(() => {
    setOpen(!open)
  }, [open])

  const selectedOptions = React.useMemo(() => {
    return options.filter(option => selected.includes(option.value))
  }, [options, selected])

  // Component ready for production

  // TEMPORARY: Completely simplified version without Popover
  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleToggle}
      >
        <span className="flex-1 text-left">
          {selectedOptions.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.slice(0, maxCount).map(option => (
                <span key={option.value} className="inline-flex items-center bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">
                  {option.label}
                  <button
                    type="button"
                    className="ml-1 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUnselect(option.value)
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

      {/* Options List - Toggle visibility */}
      {open && options.length > 0 && (
        <div 
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[200px] overflow-y-auto rounded-md border border-border bg-popover shadow-lg"
        >
          {/* Search input */}
          <div className="p-2 border-b border-border">
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full px-2 py-1 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              onChange={(e) => {
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
                  onClick={() => handleSelect(option.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSelect(option.value)
                    }
                  }}
                >
                  <div className="mr-2 h-4 w-4 flex items-center justify-center">
                    {isSelected ? (
                      <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : null}
                  </div>
                  {option.label}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )

  // Original Popover implementation (commented for debugging)
  /*
  return (
    <Popover open={open} onOpenChange={(newOpen) => {
      console.log('🔍 Popover onOpenChange:', { from: open, to: newOpen })
      setOpen(newOpen)
    }}>
      <PopoverTrigger asChild>
        <MultiSelectTrigger
          open={open}
          selected={selected}
          selectedOptions={selectedOptions}
          maxCount={maxCount}
          placeholder={placeholder}
          className={className}
          onToggle={handleToggle}
          onUnselect={handleUnselect}
        />
      </PopoverTrigger>
      <PopoverContent 
        className="w-[200px] p-0 z-50" 
        align="start"
        style={{ backgroundColor: 'white', border: '1px solid #ccc', visibility: 'visible', display: 'block' }}
      >
        <div style={{ padding: '8px', backgroundColor: 'yellow', fontSize: '12px' }}>
          🔍 DEBUG: PopoverContent renderizado!
        </div>
        <OptionList options={options} selected={selected} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  )
  */
}
