/**
 * AI Summary Component
 * Componente para exibir resumos gerados por IA com estilo Loved CRM
 * Baseado na especificação do agente 07-design-tokens.md
 */

import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const getConfidenceColor = (conf: number): string => {
  if (conf >= 80) {return 'text-emerald-600 bg-emerald-50'}
  if (conf >= 60) {return 'text-yellow-600 bg-yellow-50'}
  return 'text-red-600 bg-red-50'
}

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

const sentimentConfig = {
  positive: {
    icon: TrendingUp,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    label: 'Positivo'
  },
  negative: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-200',
    label: 'Negativo'
  },
  neutral: {
    icon: CheckCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    label: 'Neutro'
  },
  mixed: {
    icon: Sparkles,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    label: 'Misto'
  }
}

function SummaryHeader({ 
  sentiment, 
  confidence, 
  onCopy, 
  onRegenerate, 
  expandable, 
  isExpanded, 
  setIsExpanded 
}: {
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed'
  confidence?: number
  onCopy?: () => void
  onRegenerate?: () => void
  expandable: boolean
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
}): React.ReactElement {
  const sentimentInfo = sentiment == null ? null : sentimentConfig[sentiment]
  const SentimentIcon = sentimentInfo?.icon

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-600 animate-pulse" />
        <span className="text-sm font-semibold text-violet-700">
          Resumo com IA
        </span>
        {sentiment != null && SentimentIcon != null ? <Badge variant="secondary" className={cn(
            "text-xs",
            sentimentInfo?.color,
            sentimentInfo?.bgColor
          )}>
            <SentimentIcon className="h-3 w-3 mr-1" />
            {sentimentInfo?.label}
          </Badge> : null}
      </div>

      <div className="flex items-center gap-2">
        {confidence != null && confidence > 0 ? <Badge 
            variant="secondary" 
            className={cn("text-xs", getConfidenceColor(confidence))}
            title={`Confiança: ${confidence}%`}
          >
            {confidence}%
          </Badge> : null}
        
        <SummaryActionButtons 
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

function SummaryActionButtons({
  onCopy,
  onRegenerate,
  expandable,
  isExpanded,
  setIsExpanded
}: {
  onCopy?: () => void
  onRegenerate?: () => void
  expandable: boolean
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
}): React.ReactElement {
  const handleCopyClick = (): void => {
    if (onCopy != null) {
      onCopy()
    }
  }

  const handleRegenerateClick = (): void => {
    if (onRegenerate != null) {
      onRegenerate()
    }
  }

  const handleExpandClick = (): void => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="flex items-center gap-1">
      {onCopy == null ? null : <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleCopyClick}
          title="Copiar resumo"
        >
          <Copy className="h-3 w-3" />
        </Button>}
      
      {onRegenerate == null ? null : <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleRegenerateClick}
          title="Regenerar resumo"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>}

      {expandable ? <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleExpandClick}
          title={isExpanded ? "Recolher" : "Expandir"}
        >
          {isExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button> : null}
    </div>
  )
}

function NextActionsSection({ 
  nextActions, 
  isExpanded 
}: { 
  nextActions: string[]
  isExpanded: boolean 
}): React.ReactElement | null {
  if (nextActions.length === 0 || !isExpanded) {
    return null
  }

  return (
    <div className="px-4 pb-4">
      <h4 className="text-xs font-medium text-violet-700 mb-2 uppercase tracking-wide">
        Próximas Ações Sugeridas
      </h4>
      <ul className="space-y-1">
        {nextActions.map((action, index) => (
          <li key={`action-${action.slice(0, 20)}-${index}`} className="flex items-start gap-2 text-xs text-violet-800">
            <span className="text-violet-400 mt-0.5">•</span>
            {action}
          </li>
        ))}
      </ul>
    </div>
  )
}

function MetadataFooter({ 
  modelUsed, 
  tokensUsed, 
  isExpanded 
}: { 
  modelUsed?: string
  tokensUsed?: number
  isExpanded: boolean 
}): React.ReactElement | null {
  if ((modelUsed == null && tokensUsed == null) || !isExpanded) {
    return null
  }

  return (
    <div className="px-4 py-2 border-t border-violet-200/50 bg-violet-50/50">
      <div className="flex items-center justify-between text-xs text-violet-600">
        <span>Modelo: {modelUsed}</span>
        {tokensUsed != null && tokensUsed > 0 ? <span>{tokensUsed.toLocaleString()} tokens</span> : null}
      </div>
    </div>
  )
}

export function AISummary({ 
  summary, 
  confidence, 
  sentiment,
  nextActions = [],
  modelUsed = 'gpt-4',
  tokensUsed,
  className,
  expandable = false,
  onRegenerate,
  onCopy
}: AISummaryProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(!expandable)
  const [copied, setCopied] = useState(false)

  const handleCopy = async (): Promise<void> => {
    if (onCopy == null) {
      await navigator.clipboard.writeText(summary)
    } else {
      onCopy()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const enhancedOnCopy = (): void => {
    void handleCopy()
  }

  return (
    <div className={cn(
      "rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 overflow-hidden",
      "transition-all duration-300 hover:shadow-md",
      className
    )}>
      {/* Header */}
      <div className="p-4">
        <SummaryHeader 
          sentiment={sentiment}
          confidence={confidence}
          onCopy={enhancedOnCopy}
          onRegenerate={onRegenerate}
          expandable={expandable}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />

        {/* Summary Content */}
        <div className={cn(
          "transition-all duration-300 overflow-hidden",
          !isExpanded && expandable && "max-h-12"
        )}>
          <p className="text-sm text-violet-900 leading-relaxed">
            {summary}
          </p>
        </div>

        {copied ? <div className="mt-2 text-xs text-emerald-600 font-medium">
            ✓ Resumo copiado!
          </div> : null}
      </div>

      <NextActionsSection nextActions={nextActions} isExpanded={isExpanded} />
      <MetadataFooter modelUsed={modelUsed} tokensUsed={tokensUsed} isExpanded={isExpanded} />
    </div>
  )
}

// Variante compacta para usar em cards menores
export function AISummaryCompact({ 
  summary, 
  confidence, 
  className 
}: { 
  summary: string
  confidence?: number
  className?: string 
}): React.ReactElement {
  const [showFull, setShowFull] = useState(false)
  const truncatedSummary = summary.length > 100 ? `${summary.slice(0, 100)}...` : summary

  return (
    <div className={cn(
      "p-3 rounded-lg border border-violet-200 bg-violet-50/50",
      className
    )}>
      <div className="flex items-start gap-2">
        <Sparkles className="h-3 w-3 text-violet-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-violet-800 leading-relaxed">
            {showFull ? summary : truncatedSummary}
          </p>
          {summary.length > 100 && (
            <button
              type="button"
              onClick={() => setShowFull(!showFull)}
              className="text-xs text-violet-600 hover:text-violet-700 mt-1 font-medium"
            >
              {showFull ? 'Ver menos' : 'Ver mais'}
            </button>
          )}
        </div>
        {confidence != null && confidence > 0 ? <Badge variant="secondary" className="text-xs bg-white/50">
            {confidence}%
          </Badge> : null}
      </div>
    </div>
  )
}