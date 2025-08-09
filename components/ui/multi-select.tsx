'use client'

import * as React from 'react'

import { TriggerButton, DropdownContent } from './multi-select-helpers'

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

  return (
    <div className="relative">
      <TriggerButton
        open={open}
        selectedOptions={selectedOptions}
        maxCount={maxCount}
        placeholder={placeholder}
        onToggle={handleToggle}
        onUnselect={handleUnselect}
      />
      <DropdownContent open={open} options={options} selected={selected} onSelect={handleSelect} />
    </div>
  )
}
