'use client'

import { X } from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardHeader, CardTitle } from '@/components/ui/card'

import { FilterContent } from './pipeline-filters-sections'

import type { PipelineFiltersState } from './pipeline-filters-types'

interface FilterHeaderProps {
  activeFilterCount: number
  onClearAll: () => void
  onClose: () => void
}

export function FilterHeader({
  activeFilterCount,
  onClearAll,
  onClose,
}: FilterHeaderProps): JSX.Element {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">Filtrar Pipeline</CardTitle>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearAll} className="h-8 px-2 text-xs">
              Limpar Tudo
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
  )
}

interface FilterTriggerProps {
  activeFilterCount: number
  isExpanded?: boolean
  onClick?: () => void
}

export const FilterTrigger = React.forwardRef<
  HTMLButtonElement,
  FilterTriggerProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ activeFilterCount, isExpanded = false, onClick, ...props }, ref) => {
  return (
    <Button ref={ref} variant="outline" className="relative" onClick={onClick} {...props}>
      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        />
      </svg>
      Filtros
      {/* Chevron indicator */}
      <svg
        className={`ml-2 h-4 w-4 transition-transform duration-200 ${
          isExpanded ? 'rotate-180' : ''
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
      {activeFilterCount > 0 && (
        <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  )
})

FilterTrigger.displayName = 'FilterTrigger'

interface FilterContentWrapperProps {
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

export function FilterContentWrapper({
  isLoading,
  filters,
  filterOptions,
  updateFilter,
}: FilterContentWrapperProps): JSX.Element {
  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando opções...</div>
  }

  return (
    <FilterContent
      isLoading={isLoading}
      filters={filters}
      filterOptions={filterOptions}
      updateFilter={updateFilter}
    />
  )
}
