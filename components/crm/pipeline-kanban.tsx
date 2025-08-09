/**
 * Pipeline Kanban - CRM Pipeline Kanban Board
 * Kanban board para pipeline de vendas brasileiro
 * Baseado na especificação do agente 09-ui-ux-designer.md
 * Integrado com CRM API real
 */
'use client'

import { useState, useMemo } from 'react'

import { useAuthStore } from '@/stores/auth'

import { usePipelineDataHandlers } from './pipeline-data-handlers'
import { usePipelineHandlers } from './pipeline-handlers'
import { LoadingState, ErrorState } from './pipeline-kanban-helpers'
import { PipelineKanbanLayout } from './pipeline-kanban-main-layout'
import { applyFiltersToStages, isTruthy } from './pipeline-kanban-utils'
import { usePipelineWebSocketHandlers } from './pipeline-websocket-handlers'

import type { PipelineFiltersState } from './pipeline-filters-types'

interface PipelineKanbanProps {
  className?: string
}

export function PipelineKanban({ className }: PipelineKanbanProps): React.ReactElement {
  return <PipelineKanbanInner className={className} />
}

function PipelineKanbanInner({ className }: PipelineKanbanProps): React.ReactElement {
  const { user, organization } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'kanban' | 'metrics' | 'advanced'>('kanban')
  const [currentFilters, setCurrentFilters] = useState<PipelineFiltersState>({
    stages: [],
    sources: [],
    assignedUsers: [],
    tags: [],
    dateFrom: null,
    dateTo: null,
    valueMin: '',
    valueMax: '',
  })

  // Use extracted data handlers
  const { stages, loading, error, reloadLeadsData, setStages, setError } = usePipelineDataHandlers()

  // Use extracted WebSocket handlers
  const { isConnected, isPolling, activeUsers, sendMessage } = usePipelineWebSocketHandlers(
    reloadLeadsData,
    stages,
    setStages
  )

  // Use extracted pipeline handlers
  const pipelineHandlers = usePipelineHandlers(reloadLeadsData)

  // Apply filters to stages data
  const filteredStages = useMemo(() => {
    return applyFiltersToStages(stages, currentFilters)
  }, [stages, currentFilters])

  const handleDragDrop = async (targetStageId: string): Promise<void> => {
    if (isTruthy(pipelineHandlers.draggedLead)) {
      sendMessage({
        type: 'lead_drag_start',
        leadId: pipelineHandlers.draggedLead.id,
        timestamp: new Date().toISOString(),
      })
    }

    await pipelineHandlers.handleDrop({
      targetStageId,
      sendMessage,
      setStages,
      setError,
    })
  }

  // Show loading state while auth is loading or while fetching data
  if (!isTruthy(user) || !isTruthy(organization) || loading) {
    return <LoadingState className={className} />
  }

  // Show error state
  if (isTruthy(error)) {
    return <ErrorState error={error} className={className} />
  }

  return (
    <PipelineKanbanLayout
      className={className}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      currentFilters={currentFilters}
      onFiltersChange={setCurrentFilters}
      filteredStages={filteredStages}
      pipelineHandlers={pipelineHandlers}
      onDragDrop={(stageId: string) => {
        void handleDragDrop(stageId)
      }}
      isConnected={isConnected}
      isPolling={isPolling}
      activeUsers={activeUsers}
    />
  )
}
