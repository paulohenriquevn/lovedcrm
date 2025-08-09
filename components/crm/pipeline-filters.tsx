'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, FilterIcon, X } from 'lucide-react'
import { useState, useEffect } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { crmLeadsService } from '@/services/crm-leads'

export interface PipelineFiltersState {
  stages: string[]
  sources: string[]
  assignedUsers: string[]
  tags: string[]
  dateFrom: Date | null
  dateTo: Date | null
  valueMin: string
  valueMax: string
}

interface PipelineFiltersProps {
  onFiltersChange: (filters: PipelineFiltersState) => void
  className?: string
}

const STAGE_LABELS = {
  lead: 'Lead',
  contato: 'Contato',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  fechado: 'Fechado'
}

export function PipelineFilters({ onFiltersChange, className }: PipelineFiltersProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<PipelineFiltersState>({
    stages: [],
    sources: [],
    assignedUsers: [],
    tags: [],
    dateFrom: null,
    dateTo: null,
    valueMin: '',
    valueMax: ''
  })

  const { data: filterOptions, isLoading } = useQuery({
    queryKey: ['pipeline-filter-options'],
    queryFn: () => crmLeadsService.getPipelineFilters(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Notify parent when filters change
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = <K extends keyof PipelineFiltersState>(
    key: K,
    value: PipelineFiltersState[K]
  ): void => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearAllFilters = (): void => {
    setFilters({
      stages: [],
      sources: [],
      assignedUsers: [],
      tags: [],
      dateFrom: null,
      dateTo: null,
      valueMin: '',
      valueMax: ''
    })
  }

  const getActiveFilterCount = (): number => {
    let count = 0
    if (filters.stages.length > 0) {count++}
    if (filters.sources.length > 0) {count++}
    if (filters.assignedUsers.length > 0) {count++}
    if (filters.tags.length > 0) {count++}
    if (filters.dateFrom ?? filters.dateTo) {count++}
    if (filters.valueMin ?? filters.valueMax) {count++}
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <FilterIcon className="mr-2 h-4 w-4" />
            Filtros
            {activeFilterCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96" align="start">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filtrar Pipeline</CardTitle>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-8 px-2 text-xs"
                    >
                      Limpar Tudo
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Carregando opções...</div>
              ) : (
                <>
                  {/* Stage Filter */}
                  <div className="space-y-2">
                    <Label>Estágios</Label>
                    <MultiSelect
                      options={filterOptions?.stages?.map(stage => ({
                        value: stage,
                        label: STAGE_LABELS[stage as keyof typeof STAGE_LABELS] ?? stage
                      })) ?? []}
                      selected={filters.stages}
                      onChange={(values) => updateFilter('stages', values)}
                      placeholder="Selecionar estágios..."
                    />
                  </div>

                  <Separator />

                  {/* Source Filter */}
                  <div className="space-y-2">
                    <Label>Origem</Label>
                    <MultiSelect
                      options={filterOptions?.sources?.map(source => ({
                        value: source,
                        label: source
                      })) ?? []}
                      selected={filters.sources}
                      onChange={(values) => updateFilter('sources', values)}
                      placeholder="Selecionar origens..."
                    />
                  </div>

                  <Separator />

                  {/* Assigned User Filter */}
                  <div className="space-y-2">
                    <Label>Responsável</Label>
                    <MultiSelect
                      options={filterOptions?.assigned_users?.map(user => ({
                        value: user.id,
                        label: user.name
                      })) ?? []}
                      selected={filters.assignedUsers}
                      onChange={(values) => updateFilter('assignedUsers', values)}
                      placeholder="Selecionar responsáveis..."
                    />
                  </div>

                  <Separator />

                  {/* Tags Filter */}
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <MultiSelect
                      options={filterOptions?.available_tags?.map(tag => ({
                        value: tag,
                        label: tag
                      })) ?? []}
                      selected={filters.tags}
                      onChange={(values) => updateFilter('tags', values)}
                      placeholder="Selecionar tags..."
                    />
                  </div>

                  <Separator />

                  {/* Date Range Filter */}
                  <div className="space-y-2">
                    <Label>Período</Label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "flex-1 justify-start text-left font-normal",
                              !filters.dateFrom && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateFrom ? (
                              format(filters.dateFrom, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              "Data inicial"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters.dateFrom ?? undefined}
                            onSelect={(date) => updateFilter('dateFrom', date ?? null)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "flex-1 justify-start text-left font-normal",
                              !filters.dateTo && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateTo ? (
                              format(filters.dateTo, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              "Data final"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters.dateTo ?? undefined}
                            onSelect={(date) => updateFilter('dateTo', date ?? null)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <Separator />

                  {/* Value Range Filter */}
                  <div className="space-y-2">
                    <Label>Valor Estimado</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Mín. R$"
                          value={filters.valueMin}
                          onChange={(e) => updateFilter('valueMin', e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Máx. R$"
                          value={filters.valueMax}
                          onChange={(e) => updateFilter('valueMax', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  )
}