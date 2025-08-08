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
    count: isTargetStage 
      ? leadsWithoutDragged.length + 1
      : leadsWithoutDragged.length
  }
}

export function usePipelineDragLogic(reloadLeadsData: () => Promise<void>): DragLogicReturn {
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)

  const handleDragStart = (lead: Lead): void => {
    setDraggedLead(lead)
  }

  const updateStageOptimistically = (
    targetStage: PipelineStage,
    lead: Lead,
    setStages: React.Dispatch<React.SetStateAction<PipelineStageDisplay[]>>
  ): void => {
    setStages(prevStages => 
      prevStages.map(stage => updateStageLeads(stage, targetStage, lead))
    )
  }

  const notifyStageChange = (
    lead: Lead,
    targetStage: PipelineStage,
    sendMessage: (msg: Record<string, unknown>) => void
  ): void => {
    console.log('📤 Sending stage_change message:', {
      leadId: lead.id,
      leadName: lead.name,
      oldStage: lead.stage,
      newStage: targetStage
    })
    
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
      timestamp: new Date().toISOString()
    })
  }

  const handleDropError = (
    error: unknown,
    setError: React.Dispatch<React.SetStateAction<string | null>>
  ): void => {
    // eslint-disable-next-line no-console
    console.error('Erro ao mover lead:', error)
    setError('Erro ao mover lead. A página será recarregada.')
    setTimeout(() => {
      void reloadLeadsData()
      setError(null)
    }, 2000)
  }

  const handleDrop = async ({
    targetStageId,
    sendMessage,
    setStages,
    setError
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
      console.log('🔄 Starting lead move process:', {
        leadId: draggedLead.id,
        from: currentStage,
        to: targetStage
      })
      
      updateStageOptimistically(targetStage, draggedLead, setStages)
      notifyStageChange(draggedLead, targetStage, sendMessage)
      
      console.log('📞 Calling API to move lead...')
      await crmLeadsService.moveLeadToStage(
        draggedLead.id,
        targetStage,
        `Movido de ${currentStage} para ${targetStage}`
      )
      console.log('✅ API call completed successfully')

      console.log('🔄 Reloading leads data...')
      void reloadLeadsData()
    } catch (error) {
      handleDropError(error, setError)
    } finally {
      setDraggedLead(null)
    }
  }

  return {
    draggedLead,
    handleDragStart,
    handleDrop
  }
}