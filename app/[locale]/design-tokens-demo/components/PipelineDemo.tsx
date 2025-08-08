import { PipelineStage, PipelineProgress } from '@/components/crm/pipeline-stage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PipelineDemoProps {
  selectedStage: 'lead' | 'contact' | 'proposal' | 'negotiation' | 'closed'
  onStageChange: (stage: 'lead' | 'contact' | 'proposal' | 'negotiation' | 'closed') => void
}

export function PipelineDemo({ selectedStage, onStageChange }: PipelineDemoProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estágios do Pipeline</CardTitle>
        <CardDescription>
          Pipeline brasileiro: Lead → Contato → Proposta → Negociação → Fechado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {(['lead', 'contact', 'proposal', 'negotiation', 'closed'] as const).map(stage => (
            <PipelineStage
              key={stage}
              stage={stage}
              count={Math.floor(Math.random() * 10) + 1}
              variant="kanban"
              interactive
              onClick={() => onStageChange(stage)}
              className={selectedStage === stage ? 'ring-2 ring-primary' : ''}
            />
          ))}
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium">Progresso do Pipeline:</p>
          <PipelineProgress currentStage={selectedStage} />
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium">Variantes Compactas:</p>
          <div className="flex flex-wrap gap-3">
            {(['lead', 'contact', 'proposal', 'negotiation', 'closed'] as const).map(stage => (
              <PipelineStage key={stage} stage={stage} count={5} variant="compact" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
