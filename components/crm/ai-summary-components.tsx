/**
 * AI Summary Internal Components
 * Componentes internos extraídos para reduzir complexidade
 */

import { Sparkles, ChevronDown, ChevronUp, Copy, RefreshCw, CheckCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const getConfidenceColor = (conf: number): string => {
  if (conf >= 80) {
    return 'text-emerald-600 bg-emerald-50'
  }
  if (conf >= 60) {
    return 'text-yellow-600 bg-yellow-50'
  }
  return 'text-red-600 bg-red-50'
}

interface AISummaryHeaderProps {
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed'
  confidence?: number
  onCopy?: () => void
  onRegenerate?: () => void
  expandable: boolean
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
}

// Sentiment configuration
const sentimentConfig = {
  positive: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    label: 'Positivo',
  },
  negative: {
    icon: CheckCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Negativo',
  },
  neutral: {
    icon: CheckCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    label: 'Neutro',
  },
  mixed: {
    icon: CheckCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Misto',
  },
}

// Helper to render sentiment badge
function SentimentBadge({ sentiment }: { sentiment?: string }): React.ReactElement | null {
  if (sentiment === null || sentiment === undefined || sentiment === '') {
    return null
  }

  const sentimentInfo = sentimentConfig[sentiment as keyof typeof sentimentConfig]
  if (sentimentInfo === null || sentimentInfo === undefined) {
    return null
  }

  const SentimentIcon = sentimentInfo.icon

  return (
    <Badge
      variant="secondary"
      className={cn('text-xs', sentimentInfo.color, sentimentInfo.bgColor)}
    >
      <SentimentIcon className="h-3 w-3 mr-1" />
      {sentimentInfo.label}
    </Badge>
  )
}

// Helper to render confidence badge
function ConfidenceBadge({ confidence }: { confidence?: number }): React.ReactElement | null {
  if (confidence === null || confidence === undefined || confidence <= 0) {
    return null
  }

  return (
    <Badge
      variant="secondary"
      className={cn('text-xs', getConfidenceColor(confidence))}
      title={`Confiança: ${confidence}%`}
    >
      {confidence}%
    </Badge>
  )
}

export function AISummaryHeader({
  sentiment,
  confidence,
  onCopy,
  onRegenerate,
  expandable,
  isExpanded,
  setIsExpanded,
}: AISummaryHeaderProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-600 animate-pulse" />
        <span className="text-sm font-semibold text-violet-700">Resumo com IA</span>
        <SentimentBadge sentiment={sentiment} />
      </div>

      <div className="flex items-center gap-2">
        <ConfidenceBadge confidence={confidence} />
        <AISummaryActions
          onCopy={onCopy}
          onRegenerate={onRegenerate}
          expandable={expandable}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
      </div>
    </div>
  )
}

interface AISummaryActionsProps {
  onCopy?: () => void
  onRegenerate?: () => void
  expandable: boolean
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
}

// Helper components for actions
function CopyButton({ onCopy }: { onCopy?: () => void }): React.ReactElement | null {
  if (onCopy === null || onCopy === undefined) {
    return null
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0"
      onClick={onCopy}
      title="Copiar resumo"
    >
      <Copy className="h-3 w-3" />
    </Button>
  )
}

function RegenerateButton({
  onRegenerate,
}: {
  onRegenerate?: () => void
}): React.ReactElement | null {
  if (onRegenerate === null || onRegenerate === undefined) {
    return null
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0"
      onClick={onRegenerate}
      title="Regenerar resumo"
    >
      <RefreshCw className="h-3 w-3" />
    </Button>
  )
}

function ExpandButton({
  expandable,
  isExpanded,
  setIsExpanded,
}: {
  expandable: boolean
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
}): React.ReactElement | null {
  if (expandable === false) {
    return null
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0"
      onClick={() => setIsExpanded(!isExpanded)}
      title={isExpanded ? 'Recolher' : 'Expandir'}
    >
      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
    </Button>
  )
}

function AISummaryActions({
  onCopy,
  onRegenerate,
  expandable,
  isExpanded,
  setIsExpanded,
}: AISummaryActionsProps): React.ReactElement {
  return (
    <div className="flex items-center gap-1">
      <CopyButton onCopy={onCopy} />
      <RegenerateButton onRegenerate={onRegenerate} />
      <ExpandButton expandable={expandable} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
    </div>
  )
}

export function NextActionsSection({
  nextActions,
  isExpanded,
}: {
  nextActions?: string[]
  isExpanded: boolean
}): React.ReactElement | null {
  if (
    nextActions === null ||
    nextActions === undefined ||
    nextActions.length === 0 ||
    !isExpanded
  ) {
    return null
  }

  return (
    <div className="px-4 pb-4">
      <h4 className="text-xs font-medium text-violet-700 mb-2 uppercase tracking-wide">
        Próximas Ações Sugeridas
      </h4>
      <ul className="space-y-1">
        {nextActions.map(action => (
          <li
            key={`action-${action.slice(0, 20)}`}
            className="flex items-start gap-2 text-xs text-violet-800"
          >
            <span className="text-violet-400 mt-0.5">•</span>
            {action}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Helper to check if metadata should be shown
function shouldShowMetadata(
  modelUsed?: string,
  tokensUsed?: number,
  isExpanded?: boolean
): boolean {
  if (isExpanded === false) {
    return false
  }
  return (
    Boolean(modelUsed) || Boolean(tokensUsed !== null && tokensUsed !== undefined && tokensUsed > 0)
  )
}

export function MetadataFooter({
  modelUsed,
  tokensUsed,
  isExpanded,
}: {
  modelUsed?: string
  tokensUsed?: number
  isExpanded: boolean
}): React.ReactElement | null {
  if (!shouldShowMetadata(modelUsed, tokensUsed, isExpanded)) {
    return null
  }

  return (
    <div className="px-4 py-3 bg-violet-50 border-t border-violet-100 rounded-b-lg">
      <div className="flex items-center justify-between text-xs text-violet-600">
        <span>Modelo: {modelUsed}</span>
        {tokensUsed !== null && tokensUsed !== undefined && tokensUsed > 0 && (
          <span>{tokensUsed.toLocaleString()} tokens</span>
        )}
      </div>
    </div>
  )
}
