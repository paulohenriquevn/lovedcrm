/**
 * Variable Helpers Sub-Components
 * Individual components extracted from variable-helpers.tsx
 */

import { Plus, Variable } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  AVAILABLE_VARIABLES,
  VARIABLE_DESCRIPTIONS,
  type AvailableVariable,
} from '@/types/template'

interface VariableCardProps {
  variable: AvailableVariable
  onClick: (variable: string) => void
}

export function VariableCard({ variable, onClick }: VariableCardProps): React.ReactElement {
  const handleClick = (): void => {
    onClick(variable)
  }

  return (
    <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={handleClick}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Variable className="h-4 w-4 text-muted-foreground" />
            <div>
              <code className="text-sm font-mono bg-muted px-1 py-0.5 rounded">
                {`{{${variable}}}`}
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                {VARIABLE_DESCRIPTIONS[variable]}
              </p>
            </div>
          </div>
          <Plus className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}

interface VariableSelectorProps {
  onVariableSelect: (variable: string) => void
  triggerContent?: React.ReactNode
  searchPlaceholder?: string
}

export function VariableSelector({
  onVariableSelect,
  triggerContent,
  searchPlaceholder = 'Buscar variáveis...',
}: VariableSelectorProps): React.ReactElement {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const filteredVariables = AVAILABLE_VARIABLES.filter(
    variable =>
      variable.toLowerCase().includes(searchValue.toLowerCase()) ||
      VARIABLE_DESCRIPTIONS[variable].toLowerCase().includes(searchValue.toLowerCase())
  )

  const handleVariableSelect = (variable: string): void => {
    onVariableSelect(`{{${variable}}}`)
    setOpen(false)
    setSearchValue('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {triggerContent ?? (
          <Button variant="outline" size="sm">
            <Variable className="h-4 w-4 mr-2" />
            Inserir Variável
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" side="bottom" align="start">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={value => setSearchValue(value)}
          />
          <CommandList>
            <CommandEmpty>Nenhuma variável encontrada.</CommandEmpty>
            <CommandGroup heading="Variáveis Disponíveis">
              {filteredVariables.map(variable => (
                <CommandItem
                  key={variable}
                  value={variable}
                  onSelect={() => handleVariableSelect(variable)}
                  className="flex items-center gap-2 p-3"
                >
                  <Variable className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-muted px-1 py-0.5 rounded">
                        {`{{${variable}}}`}
                      </code>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {VARIABLE_DESCRIPTIONS[variable]}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
