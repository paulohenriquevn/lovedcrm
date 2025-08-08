/**
 * CRM Dashboard Page
 * Página principal do CRM com Pipeline Kanban
 */
'use client'

import { PipelineKanban } from '@/components/crm/pipeline-kanban'

export default function CRMPage() {
  console.log('🎯 CRM Page component rendering')
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipeline CRM</h1>
          <p className="text-muted-foreground">
            Gerencie seus leads e acompanhe o pipeline de vendas
          </p>
        </div>
      </div>

      {/* Pipeline Kanban */}
      <div className="h-[80vh]">
        <PipelineKanban />
      </div>
    </div>
  )
}