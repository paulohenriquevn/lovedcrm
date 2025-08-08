/**
 * Pipeline Stage Component
 * Componente para representar estágios do pipeline de vendas do CRM
 * Baseado na especificação do agente 07-design-tokens.md
 */

import { LucideIcon, User, Phone, FileText, Handshake, CheckCircle2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { pipelineStageLabels } from '@/types/design-tokens'

type PipelineStage = 'lead' | 'contact' | 'proposal' | 'negotiation' | 'closed'

interface PipelineStageProps {
  stage: PipelineStage
  count?: number
  className?: string
  variant?: 'default' | 'compact' | 'kanban'
  interactive?: boolean
  onClick?: () => void
}

const stageConfig: Record<
  PipelineStage,
  {
    styles: string
    icon: LucideIcon
    description: string
  }
> = {
  lead: {
    styles: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
    icon: User,
    description: 'Novos leads captados',
  },
  contact: {
    styles: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    icon: Phone,
    description: 'Em processo de contato',
  },
  proposal: {
    styles: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100',
    icon: FileText,
    description: 'Proposta enviada',
  },
  negotiation: {
    styles: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
    icon: Handshake,
    description: 'Em negociação',
  },
  closed: {
    styles: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
    icon: CheckCircle2,
    description: 'Negócio fechado',
  },
}

const createKeyDownHandler =
  (onClick?: () => void) =>
  (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const handleClick = onClick ?? (() => {})
      handleClick()
    }
  }

function InteractiveHint({ interactive }: { interactive: boolean }): React.ReactElement | null {
  if (interactive !== true) {
    return null
  }

  return <div className="text-xs opacity-50 mt-2">Clique para ver detalhes</div>
}

function CompactPipelineStage({
  stage,
  count,
  className,
  interactive,
  onClick,
}: Omit<PipelineStageProps, 'variant'>): React.ReactElement {
  const config = stageConfig[stage]
  const Icon = config.icon

  const handleClick = onClick ?? (() => {})
  const handleKeyDown = createKeyDownHandler(onClick)

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors',
        config.styles,
        interactive === true && 'cursor-pointer',
        className
      )}
      onClick={handleClick}
      onKeyDown={interactive === true ? handleKeyDown : undefined}
      tabIndex={interactive === true ? 0 : undefined}
      role={interactive === true ? 'button' : undefined}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{pipelineStageLabels[stage]}</span>
      {count !== null && count !== undefined && (
        <span className="text-xs opacity-75 bg-white/50 px-1.5 py-0.5 rounded-full">{count}</span>
      )}
    </div>
  )
}

function KanbanPipelineStage({
  stage,
  count,
  className,
  interactive,
  onClick,
}: Omit<PipelineStageProps, 'variant'>): React.ReactElement {
  const config = stageConfig[stage]
  const Icon = config.icon

  const handleClick = onClick ?? (() => {})
  const handleKeyDown = createKeyDownHandler(onClick)

  return (
    <div
      className={cn(
        'rounded-lg border-2 border-dashed p-4 transition-all duration-200',
        'min-h-[120px] flex flex-col',
        config.styles,
        interactive === true && 'cursor-pointer hover:border-solid',
        className
      )}
      onClick={handleClick}
      onKeyDown={interactive === true ? handleKeyDown : undefined}
      tabIndex={interactive === true ? 0 : undefined}
      role={interactive === true ? 'button' : undefined}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <h3 className="font-semibold text-sm">{pipelineStageLabels[stage]}</h3>
        </div>
        {count !== null && count !== undefined && (
          <span className="text-sm font-medium bg-white/70 px-2 py-1 rounded-full">{count}</span>
        )}
      </div>
      <p className="text-xs opacity-75 mb-auto">{config.description}</p>
      <InteractiveHint interactive={interactive} />
    </div>
  )
}

function DefaultPipelineStage({
  stage,
  count,
  className,
  interactive,
  onClick,
}: Omit<PipelineStageProps, 'variant'>): React.ReactElement {
  const config = stageConfig[stage]
  const Icon = config.icon

  const handleClick = onClick ?? (() => {})
  const handleKeyDown = createKeyDownHandler(onClick)

  return (
    <div
      className={cn(
        'rounded-lg border-2 border-dashed p-4 transition-colors',
        config.styles,
        interactive === true && 'cursor-pointer',
        className
      )}
      onClick={handleClick}
      onKeyDown={interactive === true ? handleKeyDown : undefined}
      tabIndex={interactive === true ? 0 : undefined}
      role={interactive === true ? 'button' : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <h3 className="font-medium">{pipelineStageLabels[stage]}</h3>
        </div>
        {count !== null && count !== undefined && (
          <span className="text-sm opacity-75 font-medium">{count}</span>
        )}
      </div>
      <p className="text-xs opacity-75 mt-1">{config.description}</p>
    </div>
  )
}

export function PipelineStage({
  stage,
  count,
  className,
  variant = 'default',
  interactive = false,
  onClick,
}: PipelineStageProps): React.ReactElement {
  const commonProps = {
    stage,
    count,
    className,
    interactive,
    onClick,
  }

  switch (variant) {
    case 'compact': {
      return <CompactPipelineStage {...commonProps} />
    }
    case 'kanban': {
      return <KanbanPipelineStage {...commonProps} />
    }
    default: {
      return <DefaultPipelineStage {...commonProps} />
    }
  }
}

// Componente para progresso entre estágios
export function PipelineProgress({
  currentStage,
  className,
}: {
  currentStage: PipelineStage
  className?: string
}): React.ReactElement {
  const stages: PipelineStage[] = ['lead', 'contact', 'proposal', 'negotiation', 'closed']
  const currentIndex = stages.indexOf(currentStage)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {stages.map((stage, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex
        const config = stageConfig[stage]
        const Icon = config.icon

        return (
          <div key={stage} className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center justify-center h-8 w-8 rounded-full border-2 transition-colors',
                isCompleted && 'bg-emerald-500 border-emerald-500 text-white',
                isCurrent && 'border-violet-500 bg-violet-50 text-violet-700',
                !isCompleted && !isCurrent && 'border-gray-200 bg-gray-50 text-gray-400'
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            {index < stages.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-8 transition-colors',
                  index < currentIndex ? 'bg-emerald-500' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Hook para obter cor do pipeline stage
export function usePipelineStageColor(stage: PipelineStage): string {
  const colors = {
    lead: 'hsl(220, 9%, 46%)',
    contact: 'hsl(217, 91%, 60%)',
    proposal: 'hsl(43, 96%, 56%)',
    negotiation: 'hsl(25, 95%, 53%)',
    closed: 'hsl(160, 84%, 39%)',
  }

  return colors[stage]
}
