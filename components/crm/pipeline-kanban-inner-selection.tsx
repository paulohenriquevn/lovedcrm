/**
 * Pipeline Kanban Inner Selection Hook
 * Extracted bulk selection setup to reduce function size
 */
import { useMemo } from 'react'

import { useBulkSelection } from '@/hooks/use-bulk-selection'

import { useBulkSelectionData } from './pipeline-kanban-inner-hooks'
import { applyFiltersToStages } from './pipeline-kanban-utils'

import type { PipelineFiltersState } from './pipeline-filters-types'
import type { PipelineStageDisplay } from './pipeline-types'

export function usePipelineSelection(
  stages: PipelineStageDisplay[],
  filters: PipelineFiltersState
): {
  filteredStages: PipelineStageDisplay[]
  bulkSelection: ReturnType<typeof useBulkSelection>
} {
  // Apply filters to stages data
  const filteredStages = useMemo(() => {
    return applyFiltersToStages(stages, filters) ?? []
  }, [stages, filters])

  const { allLeadIds } = useBulkSelectionData(filteredStages ?? [])

  // Bulk selection state and handlers
  const bulkSelection = useBulkSelection({
    availableLeadIds: allLeadIds,
    maxSelection: 100, // Limit to 100 leads per operation
    onSelectionChange: selectedLeads => {
      // Optional: Log selection changes for debugging
      if (process.env.NODE_ENV === 'development' && selectedLeads.length > 0) {
        // eslint-disable-next-line no-console
        console.log(`📋 Selected ${selectedLeads.length} leads`)
      }
    },
    enableKeyboardShortcuts: true,
  })

  return {
    filteredStages,
    bulkSelection,
  }
}
