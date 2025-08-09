import type { PipelineFiltersState } from './pipeline-filters-types'

export function createInitialFilters(): PipelineFiltersState {
  return {
    stages: [],
    sources: [],
    assignedUsers: [],
    tags: [],
    dateFrom: null,
    dateTo: null,
    valueMin: '',
    valueMax: '',
  }
}

export function getActiveFilterCount(filters: PipelineFiltersState): number {
  const checks = [
    filters.stages.length > 0,
    filters.sources.length > 0,
    filters.assignedUsers.length > 0,
    filters.tags.length > 0,
    filters.dateFrom !== null || filters.dateTo !== null,
    filters.valueMin !== '' || filters.valueMax !== '',
  ]

  return checks.filter(Boolean).length
}

export function createFilterUpdater<T extends PipelineFiltersState>(
  setFilters: React.Dispatch<React.SetStateAction<T>>
) {
  return <K extends keyof T>(key: K, value: T[K]): void => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }
}
