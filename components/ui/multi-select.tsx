'use client'

import { Check, ChevronsUpDown, X } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

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
  placeholder = "Selecionar itens...",
  className,
  maxCount = 3
}: MultiSelectProps): React.ReactElement {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = React.useCallback((value: string) => {
    onChange(selected.filter((item) => item !== value))
  }, [selected, onChange])

  const handleSelect = React.useCallback((value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }, [selected, onChange])

  const selectedOptions = React.useMemo(() => {
    return options.filter((option) => selected.includes(option.value))
  }, [options, selected])

  const displayCount = Math.min(selectedOptions.length, maxCount)
  const remainingCount = selectedOptions.length - displayCount

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between min-h-[2.5rem] h-auto",
            className
          )}
          onClick={() => setOpen(!open)}
        >
          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.slice(0, displayCount).map((option) => (
                <Badge
                  variant="secondary"
                  key={option.value}
                  className="mr-1 mb-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUnselect(option.value)
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
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}