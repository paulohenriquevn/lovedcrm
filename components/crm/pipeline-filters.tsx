'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

import { Card } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { crmLeadsService } from '@/services/crm-leads'

import { FilterContentWrapper, FilterHeader, FilterTrigger } from './pipeline-filters-components'
import {
  createInitialFilters,
  getActiveFilterCount,
  createFilterUpdater,
} from './pipeline-filters-utils'

import type { PipelineFiltersState } from './pipeline-filters-types'

interface PipelineFiltersProps {
  onFiltersChange: (filters: PipelineFiltersState) => void
  className?: string
}

export function PipelineFilters({ onFiltersChange, className }: PipelineFiltersProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<PipelineFiltersState>(createInitialFilters)

  const { data: filterOptions, isLoading } = useQuery({
    queryKey: ['pipeline-filter-options'],
    queryFn: () => crmLeadsService.getPipelineFilters(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Notify parent when filters change
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = createFilterUpdater(setFilters)
  const clearAllFilters = (): void => setFilters(createInitialFilters())
  const activeFilterCount = getActiveFilterCount(filters)

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <FilterTrigger activeFilterCount={activeFilterCount} />
        </PopoverTrigger>
        <PopoverContent className="w-96" align="start">
          <Card className="border-0 shadow-none">
            <FilterHeader
              activeFilterCount={activeFilterCount}
              onClearAll={clearAllFilters}
              onClose={() => setIsOpen(false)}
            />
            <FilterContentWrapper
              isLoading={isLoading}
              filters={filters}
              filterOptions={filterOptions}
              updateFilter={updateFilter}
            />
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Re-export types for convenience
export type { PipelineFiltersState } from './pipeline-filters-types'
