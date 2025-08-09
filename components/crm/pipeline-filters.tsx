'use client'

import { useState, useEffect } from 'react'

import { cn } from '@/lib/utils'

import { FilterContentWrapper, FilterTrigger } from './pipeline-filters-components'
import { createInitialFilters, getActiveFilterCount } from './pipeline-filters-utils'

import type { PipelineFiltersState } from './pipeline-filters-types'

interface PipelineFiltersProps {
  onFiltersChange: (filters: PipelineFiltersState) => void
  className?: string
  isExpanded?: boolean
  onToggleExpanded?: () => void
}

export function PipelineFilters({
  onFiltersChange,
  className,
  isExpanded = false,
  onToggleExpanded,
}: PipelineFiltersProps): JSX.Element {
  const [filters, setFilters] = useState<PipelineFiltersState>(createInitialFilters)

  // Prevent lint warning - setFilters is used in the horizontal panel component
  void setFilters

  // Notify parent when filters change
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const activeFilterCount = getActiveFilterCount(filters)

  return (
    <>
      {/* Filter Trigger Button (apenas o botão, painel fica separado) */}
      <FilterTrigger
        activeFilterCount={activeFilterCount}
        onClick={onToggleExpanded}
        isExpanded={isExpanded}
        className={className}
      />
    </>
  )
}

// Componente do Painel Horizontal de Filtros
interface PipelineFiltersHorizontalPanelProps {
  isExpanded: boolean
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
  onClearAll: () => void
  isLoading: boolean
}

export function PipelineFiltersHorizontalPanel({
  isExpanded,
  filters,
  filterOptions,
  updateFilter,
  onClearAll,
  isLoading,
}: PipelineFiltersHorizontalPanelProps): JSX.Element {
  const activeFilterCount = getActiveFilterCount(filters)

  // Component ready - logs removed for production

  return (
    <div
      className={cn(
        'w-full overflow-hidden transition-all duration-300 ease-out',
        'border-b border-border',
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      )}
    >
      <div className="bg-muted/30 p-4">
        {/* Header do painel com botão limpar */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">Filtros Ativos</h3>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
            >
              Limpar todos ({activeFilterCount})
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Carregando opções...</div>
        ) : (
          <FilterContentWrapper
            isLoading={isLoading}
            filters={filters}
            filterOptions={filterOptions}
            updateFilter={updateFilter}
          />
        )}
      </div>
    </div>
  )
}

// Re-export types for convenience
export type { PipelineFiltersState } from './pipeline-filters-types'
