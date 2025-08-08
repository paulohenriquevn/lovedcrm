/**
 * Pipeline Data Utils
 * Utility functions for pipeline data manipulation
 */

import { default as crmLeadsService, Lead, PipelineStage } from '@/services/crm-leads'

import { PipelineStageDisplay } from './pipeline-types'

const STAGE_DISPLAY_CONFIG: Record<PipelineStage, { name: string; color: string }> = {
  [PipelineStage.LEAD]: {
    name: 'Lead',
    color: 'bg-muted/50 border-border'
  },
  [PipelineStage.CONTATO]: {
    name: 'Contato',
    color: 'bg-blue-500/10 border-blue-500/20'
  },
  [PipelineStage.PROPOSTA]: {
    name: 'Proposta',
    color: 'bg-yellow-500/10 border-yellow-500/20'
  },
  [PipelineStage.NEGOCIACAO]: {
    name: 'Negociação',
    color: 'bg-orange-500/10 border-orange-500/20'
  },
  [PipelineStage.FECHADO]: {
    name: 'Fechado',
    color: 'bg-emerald-500/10 border-emerald-500/20'
  }
}

const UNKNOWN_ERROR_MESSAGE = 'Erro desconhecido'

export function buildStagesDisplayData(leadsByStage: Record<PipelineStage, Lead[]>): PipelineStageDisplay[] {
  return Object.values(PipelineStage).map((stageKey) => {
    const config = STAGE_DISPLAY_CONFIG[stageKey]
    const stageLeads = leadsByStage[stageKey] ?? []
    
    return {
      id: stageKey,
      name: config.name,
      color: config.color,
      count: stageLeads.length,
      leads: stageLeads
    }
  })
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE
}

export async function loadLeadsByStage(): Promise<PipelineStageDisplay[]> {
  // CRÍTICO: Verificação client-side - evita execução durante SSR/hydration
  // Durante SSR, localStorage não existe e BaseService não consegue adicionar headers
  if (typeof window === 'undefined') {
    return [] // Retorna vazio durante server-side rendering
  }
  
  const leadsByStage = await crmLeadsService.getLeadsByStage()
  return buildStagesDisplayData(leadsByStage)
}