/**
 * AI Summary Component
 * Componente para exibir resumos gerados por IA com estilo Loved CRM
 * Baseado na especificação do agente 07-design-tokens.md
 */

import { Sparkles } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'

import { AISummaryHeader, NextActionsSection, MetadataFooter } from './ai-summary-components'

interface AISummaryProps {
  summary: string
  confidence?: number
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed'
  nextActions?: string[]
  modelUsed?: string
  tokensUsed?: number
  className?: string
  expandable?: boolean
  onRegenerate?: () => void
  onCopy?: () => void
}

export function AISummary({
  summary,
  confidence,
  sentiment,
  nextActions = [],
  modelUsed = 'gpt-4',
  tokensUsed,
  expandable = false,
  onRegenerate,
  onCopy,
}: AISummaryProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(!expandable)

  const handleCopy = async (): Promise<void> => {
    if (onCopy === null || onCopy === undefined) {
      await navigator.clipboard.writeText(summary)
    } else {
      onCopy()
    }
  }

  return (
    <div className="border border-violet-200 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 shadow-sm">
      <div className="p-4">
        <AISummaryHeader
          sentiment={sentiment}
          confidence={confidence}
          onCopy={() => void handleCopy()}
          onRegenerate={onRegenerate}
          expandable={expandable}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />

        <div className="text-sm text-gray-800 leading-relaxed mb-3">{summary}</div>

        <NextActionsSection nextActions={nextActions} isExpanded={isExpanded} />
      </div>

      <MetadataFooter modelUsed={modelUsed} tokensUsed={tokensUsed} isExpanded={isExpanded} />
    </div>
  )
}

// Componente compacto para dashboards
interface AISummaryCompactProps {
  summary: string
  confidence?: number
  className?: string
}

export function AISummaryCompact({
  summary,
  confidence,
}: AISummaryCompactProps): React.ReactElement {
  const [showFull, setShowFull] = useState(false)
  const shouldTruncate = summary.length > 120
  const displaySummary = shouldTruncate && !showFull ? `${summary.slice(0, 120)}...` : summary

  return (
    <div className="bg-gradient-to-r from-violet-100 to-purple-100 border border-violet-200 rounded-lg p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-3 w-3 text-violet-600 animate-pulse flex-shrink-0" />
            <span className="text-xs font-medium text-violet-700">IA</span>
          </div>

          <p className="text-xs text-violet-800 leading-relaxed">{displaySummary}</p>

          {shouldTruncate === true && (
            <button
              type="button"
              onClick={() => setShowFull(!showFull)}
              className="text-xs text-violet-600 hover:text-violet-800 mt-1 underline"
            >
              {showFull ? 'Ver menos' : 'Ver mais'}
            </button>
          )}
        </div>
        {confidence !== null && confidence !== undefined && confidence > 0 && (
          <Badge variant="secondary" className="text-xs bg-white/50">
            {confidence}%
          </Badge>
        )}
      </div>
    </div>
  )
}
