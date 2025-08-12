/**
 * Pipeline Kanban Inner Drag and Drop Handler
 * Extracted to reduce function size
 */
import { isTruthy } from './pipeline-kanban-utils'

import type { PipelineStageDisplay } from './pipeline-types'

type PipelineHandlers = {
  draggedLead: { id: string } | null
  handleDrop: (params: {
    targetStageId: string
    sendMessage: (msg: Record<string, unknown>) => void
    setStages: React.Dispatch<React.SetStateAction<PipelineStageDisplay[]>>
    setError: React.Dispatch<React.SetStateAction<string | null>>
  }) => Promise<void>
}

interface DragDropContext {
  pipelineHandlers: PipelineHandlers
  sendMessage: (msg: Record<string, unknown>) => void
  setStages: React.Dispatch<React.SetStateAction<PipelineStageDisplay[]>>
  setError: React.Dispatch<React.SetStateAction<string | null>>
}

export function createDragDropHandler(
  context: DragDropContext
): (targetStageId: string) => Promise<void> {
  const { pipelineHandlers, sendMessage, setStages, setError } = context
  return async (targetStageId: string): Promise<void> => {
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
}
