/**
 * Pipeline Kanban - CRM Pipeline Kanban Board
 * Kanban board para pipeline de vendas brasileiro
 * Baseado na especificação do agente 09-ui-ux-designer.md
 * Integrado com CRM API real
 */
'use client'

import { PipelineKanbanInner } from './pipeline-kanban-inner'

interface PipelineKanbanProps {
  className?: string
}

export function PipelineKanban({ className }: PipelineKanbanProps): React.ReactElement {
  return <PipelineKanbanInner className={className} />
}
