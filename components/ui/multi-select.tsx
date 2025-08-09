'use client'

import * as React from 'react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { MultiSelectTrigger, OptionList } from './multi-select-components'

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
  className,
  maxCount = 3,
}: MultiSelectProps): React.ReactElement {
  const [open, setOpen] = React.useState(true) // FORCE OPEN for debugging

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
    },
    [selected, onChange]
  )

  const handleToggle = React.useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('🔍 MultiSelect handleToggle:', { currentOpen: open, willBeOpen: !open })
    setOpen(!open)
  }, [open])

  const selectedOptions = React.useMemo(() => {
    return options.filter(option => selected.includes(option.value))
  }, [options, selected])

  // eslint-disable-next-line no-console
  console.log('🔍 MultiSelect DEBUG:', { 
    options, 
    optionsLength: options?.length,
    selected, 
    selectedOptions,
    placeholder,
    open,
    popoverOpen: open
  })

  // TEMPORARY: Completely simplified version without Popover
  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleToggle}
      >
        <span>
          {selectedOptions.length > 0 
            ? `${selectedOptions.length} selecionado(s)` 
            : placeholder
          }
        </span>
        <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Options List - Always visible for debugging */}
      <div 
        className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[200px] overflow-y-auto rounded-md border bg-white shadow-lg"
        style={{ 
          display: 'block',
          visibility: 'visible',
          backgroundColor: 'white',
          border: '2px solid red' // Red border to make it obvious
        }}
      >
        <div style={{ padding: '8px', backgroundColor: 'yellow', fontSize: '12px' }}>
          🔍 SIMPLIFIED MultiSelect - {options.length} options
        </div>
        
        {options.length === 0 ? (
          <div className="p-2 text-sm text-muted-foreground">Nenhuma opção disponível</div>
        ) : (
          options.map(option => {
            const isSelected = selected.includes(option.value)
            return (
              <div
                key={option.value}
                className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  // eslint-disable-next-line no-console
                  console.log('🔍 SIMPLIFIED Option clicked:', option.value)
                  handleSelect(option.value)
                }}
                style={{ backgroundColor: isSelected ? '#e3f2fd' : 'transparent' }}
              >
                <span className="mr-2">{isSelected ? '✅' : '⭕'}</span>
                {option.label} (value: {option.value})
              </div>
            )
          })
        )}
      </div>
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
