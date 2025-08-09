'use client'
/* eslint-disable max-lines */

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import type { PipelineFiltersState } from './pipeline-filters-types'

const STAGE_LABELS = {
  lead: 'Lead',
  contato: 'Contato',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  fechado: 'Fechado',
} as const

const NO_OPTIONS_CLASS = 'text-xs text-muted-foreground p-2 border rounded'

interface StageFilterProps {
  stages: string[]
  availableStages?: string[]
  onChange: (stages: string[]) => void
}

export function StageFilter({
  stages,
  availableStages = [],
  onChange,
}: StageFilterProps): JSX.Element {
  const stageOptions = availableStages.map(stage => ({
    value: stage,
    label: STAGE_LABELS[stage as keyof typeof STAGE_LABELS] ?? stage,
  }))

  const handleChange = (values: string[]): void => {
    onChange(values)
  }

  // Show loading or no options message
  if (availableStages.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Estágios</Label>
        <div className={NO_OPTIONS_CLASS}>
          Nenhum estágio disponível
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>Estágios</Label>
      <MultiSelect
        options={stageOptions}
        selected={stages}
        onChange={handleChange}
        placeholder="Selecionar estágios..."
      />
    </div>
  )
}

interface SourceFilterProps {
  sources: string[]
  availableSources?: string[]
  onChange: (sources: string[]) => void
}

export function SourceFilter({
  sources,
  availableSources = [],
  onChange,
}: SourceFilterProps): JSX.Element {
  const sourceOptions = availableSources.map(source => ({
    value: source,
    label: source,
  }))

  // Show loading or no options message
  if (availableSources.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Origem</Label>
        <div className={NO_OPTIONS_CLASS}>
          Nenhuma origem disponível
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>Origem</Label>
      <MultiSelect
        options={sourceOptions}
        selected={sources}
        onChange={onChange}
        placeholder="Selecionar origens..."
      />
    </div>
  )
}

interface AssignedUserFilterProps {
  assignedUsers: string[]
  availableUsers?: Array<{ id: string; name: string }>
  onChange: (users: string[]) => void
}

export function AssignedUserFilter({
  assignedUsers,
  availableUsers = [],
  onChange,
}: AssignedUserFilterProps): JSX.Element {
  const userOptions = availableUsers.map(user => ({
    value: user.id,
    label: user.name,
  }))

  // Show loading or no options message
  if (availableUsers.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Responsável</Label>
        <div className={NO_OPTIONS_CLASS}>
          Nenhum responsável disponível
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>Responsável</Label>
      <MultiSelect
        options={userOptions}
        selected={assignedUsers}
        onChange={onChange}
        placeholder="Selecionar responsáveis..."
      />
    </div>
  )
}

interface TagFilterProps {
  tags: string[]
  availableTags?: string[]
  onChange: (tags: string[]) => void
}

export function TagFilter({ tags, availableTags = [], onChange }: TagFilterProps): JSX.Element {
  const tagOptions = availableTags.map(tag => ({
    value: tag,
    label: tag,
  }))

  // Show loading or no options message
  if (availableTags.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className={NO_OPTIONS_CLASS}>
          Nenhuma tag disponível
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>Tags</Label>
      <MultiSelect
        options={tagOptions}
        selected={tags}
        onChange={onChange}
        placeholder="Selecionar tags..."
      />
    </div>
  )
}

interface DateRangeFilterProps {
  dateFrom: Date | null
  dateTo: Date | null
  onDateFromChange: (date: Date | null) => void
  onDateToChange: (date: Date | null) => void
}

export function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangeFilterProps): JSX.Element {
  return (
    <div className="space-y-2">
      <Label>Período</Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'flex-1 justify-start text-left font-normal',
                !dateFrom && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, 'dd/MM/yyyy', { locale: ptBR }) : 'Data inicial'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateFrom ?? undefined}
              onSelect={date => onDateFromChange(date ?? null)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'flex-1 justify-start text-left font-normal',
                !dateTo && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, 'dd/MM/yyyy', { locale: ptBR }) : 'Data final'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateTo ?? undefined}
              onSelect={date => onDateToChange(date ?? null)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

interface ValueRangeFilterProps {
  valueMin: string
  valueMax: string
  onValueMinChange: (value: string) => void
  onValueMaxChange: (value: string) => void
}

export function ValueRangeFilter({
  valueMin,
  valueMax,
  onValueMinChange,
  onValueMaxChange,
}: ValueRangeFilterProps): JSX.Element {
  return (
    <div className="space-y-2">
      <Label>Valor Estimado</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="number"
            placeholder="Mín. R$"
            value={valueMin}
            onChange={e => onValueMinChange(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Input
            type="number"
            placeholder="Máx. R$"
            value={valueMax}
            onChange={e => onValueMaxChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

interface FilterContentProps {
  isLoading: boolean
  filters: PipelineFiltersState
  filterOptions?: {
    stages?: string[]
    sources?: string[]
    assigned_users?: Array<{ id: string; name: string }>
    available_tags?: string[]
  }
  updateFilter: <K extends keyof PipelineFiltersState>(
    key: K,
    value: PipelineFiltersState[K]
  ) => void
}

export function FilterContent({
  isLoading,
  filters,
  filterOptions,
  updateFilter,
}: FilterContentProps): JSX.Element {
  // Component ready - debug logs removed

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando opções...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StageFilter
        stages={filters.stages}
        availableStages={filterOptions?.stages}
        onChange={values => updateFilter('stages', values)}
      />

      <SourceFilter
        sources={filters.sources}
        availableSources={filterOptions?.sources}
        onChange={values => updateFilter('sources', values)}
      />

      <AssignedUserFilter
        assignedUsers={filters.assignedUsers}
        availableUsers={filterOptions?.assigned_users}
        onChange={values => updateFilter('assignedUsers', values)}
      />

      <TagFilter
        tags={filters.tags}
        availableTags={filterOptions?.available_tags}
        onChange={values => updateFilter('tags', values)}
      />

      <DateRangeFilter
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        onDateFromChange={date => updateFilter('dateFrom', date)}
        onDateToChange={date => updateFilter('dateTo', date)}
      />

      <ValueRangeFilter
        valueMin={filters.valueMin}
        valueMax={filters.valueMax}
        onValueMinChange={value => updateFilter('valueMin', value)}
        onValueMaxChange={value => updateFilter('valueMax', value)}
      />
    </div>
  )
}
