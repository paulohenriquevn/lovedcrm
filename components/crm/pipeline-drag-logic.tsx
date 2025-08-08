/**
 * Pipeline Drag Logic
 * Extracted drag and drop logic for pipeline operations
 */

import { useState } from 'react'

import { default as crmLeadsService, Lead, PipelineStage } from '@/services/crm-leads'

import { PipelineStageDisplay, DragParams } from './pipeline-types'

interface DragLogicReturn {
  draggedLead: Lead | null
  handleDragStart: (lead: Lead) => void
  handleDrop: (params: DragParams) => Promise<void>
}

// Helper function to update stage leads during drag operation
function updateStageLeads(
  stage: PipelineStageDisplay,
  targetStage: PipelineStage,
  lead: Lead
): PipelineStageDisplay {
  const leadsWithoutDragged = stage.leads.filter(l => l.id !== lead.id)
  const isTargetStage = stage.id === targetStage.toString()

  return {
    ...stage,
    leads: isTargetStage
      ? [...leadsWithoutDragged, { ...lead, stage: targetStage }]
      : leadsWithoutDragged,
    count: isTargetStage ? leadsWithoutDragged.length + 1 : leadsWithoutDragged.length,
  }
}

// Individual helper functions for drag operations
function updateStageOptimistically(
  targetStage: PipelineStage,
  lead: Lead,
  setStages: React.Dispatch<React.SetStateAction<PipelineStageDisplay[]>>
): void {
  setStages(prevStages => prevStages.map(stage => updateStageLeads(stage, targetStage, lead)))
}

function notifyStageChange(
  lead: Lead,
  targetStage: PipelineStage,
  sendMessage: (msg: Record<string, unknown>) => void
): void {
  sendMessage({
    type: 'stage_change',
    // eslint-disable-next-line camelcase
    lead_id: lead.id,
    // eslint-disable-next-line camelcase
    old_stage: lead.stage,
    // eslint-disable-next-line camelcase
    new_stage: targetStage,
    // eslint-disable-next-line camelcase
    lead_name: lead.name,
    timestamp: new Date().toISOString(),
  })
}

function createErrorHandler(
  reloadLeadsData: () => Promise<void>
): (error: unknown, setError: React.Dispatch<React.SetStateAction<string | null>>) => void {
  return (error: unknown, setError: React.Dispatch<React.SetStateAction<string | null>>): void => {
    // eslint-disable-next-line no-console
    console.error('Erro ao mover lead:', error)
    setError('Erro ao mover lead. A página será recarregada.')
    setTimeout(() => {
      void reloadLeadsData()
      setError(null)
    }, 2000)
  }
}

async function performLeadMove(params: {
  lead: Lead
  targetStage: PipelineStage
  currentStage: PipelineStage
  setStages: React.Dispatch<React.SetStateAction<PipelineStageDisplay[]>>
  sendMessage: (msg: Record<string, unknown>) => void
}): Promise<void> {
  const { lead, targetStage, currentStage, setStages, sendMessage } = params
  updateStageOptimistically(targetStage, lead, setStages)
  notifyStageChange(lead, targetStage, sendMessage)

  await crmLeadsService.moveLeadToStage(
    lead.id,
    targetStage,
    `Movido de ${currentStage} para ${targetStage}`
  )
}

// Helper functions for drag logic (extracted from main hook)
function createDragHelpers(reloadLeadsData: () => Promise<void>): {
  updateStageOptimistically: typeof updateStageOptimistically
  notifyStageChange: typeof notifyStageChange
  handleDropError: ReturnType<typeof createErrorHandler>
  performLeadMove: typeof performLeadMove
} {
  return {
    updateStageOptimistically,
    notifyStageChange,
    handleDropError: createErrorHandler(reloadLeadsData),
    performLeadMove,
  }
}

export function usePipelineDragLogic(reloadLeadsData: () => Promise<void>): DragLogicReturn {
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)
  const helpers = createDragHelpers(reloadLeadsData)

  const handleDragStart = (lead: Lead): void => {
    setDraggedLead(lead)
  }

  const handleDrop = async ({
    targetStageId,
    sendMessage,
    setStages,
    setError,
  }: DragParams): Promise<void> => {
    if (draggedLead === null || draggedLead === undefined) {
      return
    }

    const targetStage = targetStageId as PipelineStage
    const currentStage = draggedLead.stage

    if (currentStage === targetStage) {
      setDraggedLead(null)
      return
    }

    try {
      await helpers.performLeadMove({
        lead: draggedLead,
        targetStage,
        currentStage,
        setStages,
        sendMessage,
      })
      void reloadLeadsData()
    } catch (error) {
      helpers.handleDropError(error, setError)
    } finally {
      setDraggedLead(null)
    }
  }

  return {
    draggedLead,
    handleDragStart,
    handleDrop,
  }
}
