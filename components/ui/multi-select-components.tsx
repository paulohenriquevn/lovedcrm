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
  return (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className={cn('justify-between min-h-[2.5rem] h-auto', className)}
      onClick={onToggle}
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
  return (
    <Command>
      <CommandInput placeholder="Buscar..." />
      <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
      <CommandList>
        <CommandGroup>
          {options.map(option => (
            <CommandItem
              key={option.value}
              value={option.value}
              onSelect={() => onSelect(option.value)}
            >
              <Check
                className={cn(
                  'mr-2 h-4 w-4',
                  selected.includes(option.value) ? 'opacity-100' : 'opacity-0'
                )}
              />
              {option.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
