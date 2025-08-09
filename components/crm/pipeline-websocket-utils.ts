/**
 * Pipeline WebSocket Utilities
 * Helper functions for WebSocket handlers
 */

export interface LeadData {
  id: string
  name: string
  stage?: string
  assigned_user_id?: string
  estimated_value?: number
  tags?: string[]
  source?: string
  created_at: string
  updated_at: string
}

export interface StageData {
  id: string
  name: string
  leads: LeadData[]
  count: number
}

export function removeLeadFromAllStages(stages: StageData[], leadId: string): StageData[] {
  return stages.map(stage => ({
    ...stage,
    leads: stage.leads.filter(lead => lead.id !== leadId),
    count: stage.leads.filter(lead => lead.id !== leadId).length,
  }))
}

export function findTargetStage(stages: StageData[], stageValue?: string): StageData | undefined {
  if (stageValue === null || stageValue === undefined || stageValue === '') {
    return undefined
  }

  return findStageByValue(stages, stageValue.toLowerCase())
}

function findStageByValue(stages: StageData[], lowerStageValue: string): StageData | undefined {
  return stages.find(stage => {
    const stageName = stage.name?.toLowerCase() || ''
    const stageId = stage.id?.toLowerCase() || ''

    return matchesStageIdentifier(stageId, stageName, lowerStageValue)
  })
}

function matchesStageIdentifier(stageId: string, stageName: string, value: string): boolean {
  return (
    stageId === value ||
    stageName === value ||
    stageName.includes(value) ||
    matchesCommonStageNames(stageName, value)
  )
}

function matchesCommonStageNames(stageName: string, value: string): boolean {
  const stageMatches = {
    lead: 'lead',
    contato: 'contato',
    proposta: 'proposta',
    negociacao: 'negociação',
    fechado: 'fechado',
  } as const

  const matchKey = stageMatches[value as keyof typeof stageMatches]
  return matchKey ? stageName.includes(matchKey) : false
}

export function updateStageWithLead(
  stages: StageData[],
  leadId: string,
  targetStageAndLead: { targetStage: StageData; leadData: LeadData }
): StageData[] {
  const { targetStage, leadData } = targetStageAndLead
  const stagesWithoutLead = removeLeadFromAllStages(stages, leadId)

  return stagesWithoutLead.map(stage =>
    stage.id === targetStage.id
      ? {
          ...stage,
          leads: [...stage.leads, leadData],
          count: stage.leads.length + 1,
        }
      : stage
  )
}
