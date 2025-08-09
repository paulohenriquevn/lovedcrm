/**
 * Multi-Select Component Helpers
 * Extracted components to reduce main component length
 */

import { X, ChevronsUpDown, Check } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

import { type MultiSelectOption } from './multi-select'

interface SelectedOptionsDisplayProps {
  selectedOptions: MultiSelectOption[]
  maxCount: number
  onUnselect: (value: string) => void
  placeholder: string
}

export function SelectedOptionsDisplay({
  selectedOptions,
  maxCount,
  onUnselect,
  placeholder,
}: SelectedOptionsDisplayProps): React.ReactElement {
  const displayCount = Math.min(selectedOptions.length, maxCount)
  const remainingCount = selectedOptions.length - displayCount

  if (selectedOptions.length === 0) {
    return <span>{placeholder}</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {selectedOptions.slice(0, displayCount).map(option => (
        <Badge
          variant="secondary"
          key={option.value}
          className="mr-1 mb-1"
          onClick={e => {
            e.stopPropagation()
            onUnselect(option.value)
          }}
        >
          {option.label}
          <X className="ml-1 h-3 w-3" />
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="mr-1 mb-1">
          +{remainingCount} mais
        </Badge>
      )}
    </div>
  )
}

interface MultiSelectTriggerProps {
  open: boolean
  selected: string[]
  selectedOptions: MultiSelectOption[]
  maxCount: number
  placeholder: string
  className?: string
  onToggle: () => void
  onUnselect: (value: string) => void
}

export function MultiSelectTrigger({
  open,
  selected: _selected,
  selectedOptions,
  maxCount,
  placeholder,
  className,
  onToggle,
  onUnselect,
}: MultiSelectTriggerProps): React.ReactElement {
  // eslint-disable-next-line no-console
  console.log('🔍 MultiSelectTrigger DEBUG:', { 
    open, 
    selectedOptions, 
    onToggleType: typeof onToggle,
    placeholder
  })

  return (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className={cn('justify-between min-h-[2.5rem] h-auto', className)}
      onClick={() => {
        // eslint-disable-next-line no-console
        console.log('🔍 MultiSelectTrigger clicked!')
        onToggle()
      }}
    >
      <SelectedOptionsDisplay
        selectedOptions={selectedOptions}
        maxCount={maxCount}
        onUnselect={onUnselect}
        placeholder={placeholder}
      />
      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
    </Button>
  )
}

interface OptionListProps {
  options: MultiSelectOption[]
  selected: string[]
  onSelect: (value: string) => void
}

export function OptionList({ options, selected, onSelect }: OptionListProps): React.ReactElement {
  // eslint-disable-next-line no-console
  console.log('🔍 OptionList DEBUG:', { 
    options, 
    optionsLength: options?.length,
    selected,
    onSelectType: typeof onSelect
  })

  // TEMPORARY: Simple list instead of Command for debugging
  return (
    <div className="p-2 max-h-[200px] overflow-y-auto">
      {options.length === 0 ? (
        <div className="text-sm text-muted-foreground p-2">Nenhum item encontrado</div>
      ) : (
        options.map(option => {
          // eslint-disable-next-line no-console
          console.log('🔍 Rendering option:', option)
          const isSelected = selected.includes(option.value)
          return (
            <div
              key={option.value}
              className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded"
              onClick={() => {
                // eslint-disable-next-line no-console
                console.log('🔍 Option clicked:', option.value)
                onSelect(option.value)
              }}
            >
              <Check
                className={cn(
                  'mr-2 h-4 w-4',
                  isSelected ? 'opacity-100' : 'opacity-0'
                )}
              />
              {option.label}
            </div>
          )
        })
      )}
    </div>
  )

  // Original Command implementation (commented for debugging)
  /*
  return (
    <Command>
      <CommandInput placeholder="Buscar..." />
      <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
      <CommandList>
        <CommandGroup>
          {options.map(option => {
            console.log('🔍 Rendering option:', option)
            return (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => {
                  console.log('🔍 Option clicked:', option.value)
                  onSelect(option.value)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    selected.includes(option.value) ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {option.label}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  )
  */
}
