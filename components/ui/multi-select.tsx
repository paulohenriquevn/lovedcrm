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
    },
    [selected, onChange]
  )

  const handleToggle = React.useCallback(() => {
    setOpen(!open)
  }, [open])

  const selectedOptions = React.useMemo(() => {
    return options.filter(option => selected.includes(option.value))
  }, [options, selected])

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
      <PopoverContent className="w-full p-0" align="start">
        <OptionList options={options} selected={selected} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  )
}
