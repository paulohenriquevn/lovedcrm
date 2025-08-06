/**
 * Timeline Component
 * Timeline unificada para todas as comunicações e atividades do CRM
 * Baseado na especificação do agente 07-design-tokens.md
 */

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CommunicationChannelBadge, WhatsAppMessage } from "./communication-channel"
import { AISummaryCompact } from "./ai-summary"
import { 
  MessageCircle,
  Mail,
  Phone,
  FileText,
  Sparkles,
  User,
  Calendar,
  TrendingUp,
  Activity
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"

type TimelineEntryType = 'whatsapp' | 'email' | 'voip' | 'note' | 'ai_summary' | 'lead_update' | 'meeting'

interface BaseTimelineEntry {
  id: string
  type: TimelineEntryType
  timestamp: Date
  leadId?: string
  leadName?: string
  userId?: string
  userName?: string
}

interface CommunicationEntry extends BaseTimelineEntry {
  type: 'whatsapp' | 'email' | 'voip' | 'note'
  content: string
  direction: 'inbound' | 'outbound'
  status?: 'sent' | 'delivered' | 'read' | 'failed'
  attachmentCount?: number
}

interface AISummaryEntry extends BaseTimelineEntry {
  type: 'ai_summary'
  summary: string
  confidence?: number
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed'
}

interface LeadUpdateEntry extends BaseTimelineEntry {
  type: 'lead_update'
  field: string
  oldValue: string
  newValue: string
  description: string
}

interface MeetingEntry extends BaseTimelineEntry {
  type: 'meeting'
  title: string
  description?: string
  duration?: number
  outcome?: string
}

type TimelineEntry = CommunicationEntry | AISummaryEntry | LeadUpdateEntry | MeetingEntry

interface TimelineProps {
  entries: TimelineEntry[]
  className?: string
  groupByDate?: boolean
  showLeadContext?: boolean
  onEntryClick?: (entry: TimelineEntry) => void
}

const entryConfig = {
  whatsapp: {
    icon: MessageCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'WhatsApp'
  },
  email: {
    icon: Mail,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'E-mail'
  },
  voip: {
    icon: Phone,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    label: 'Ligação'
  },
  note: {
    icon: FileText,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    label: 'Anotação'
  },
  ai_summary: {
    icon: Sparkles,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    label: 'Resumo IA'
  },
  lead_update: {
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    label: 'Atualização'
  },
  meeting: {
    icon: Calendar,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    label: 'Reunião'
  }
}

function TimelineEntryHeader({ 
  entry, 
  showLeadContext 
}: { 
  entry: TimelineEntry
  showLeadContext?: boolean 
}) {
  const config = entryConfig[entry.type]
  const Icon = config.icon

  return (
    <div className="flex items-center gap-2 mb-2">
      <div className={cn(
        "flex items-center justify-center h-6 w-6 rounded-full",
        config.bgColor
      )}>
        <Icon className={cn("h-3 w-3", config.color)} />
      </div>
      
      <div className="flex items-center gap-2 flex-1">
        <span className="text-sm font-medium text-gray-900">
          {config.label}
        </span>
        
        {entry.type === 'whatsapp' || entry.type === 'email' || entry.type === 'voip' || entry.type === 'note' ? (
          <Badge variant="outline" className="text-xs">
            {(entry as CommunicationEntry).direction === 'inbound' ? 'Recebido' : 'Enviado'}
          </Badge>
        ) : null}

        {showLeadContext && entry.leadName && (
          <Badge variant="secondary" className="text-xs">
            <User className="h-3 w-3 mr-1" />
            {entry.leadName}
          </Badge>
        )}
      </div>

      <time className="text-xs text-gray-500" title={entry.timestamp.toLocaleString('pt-BR')}>
        {formatDistanceToNow(entry.timestamp, { 
          addSuffix: true, 
          locale: ptBR 
        })}
      </time>
    </div>
  )
}

function CommunicationEntryContent({ entry }: { entry: CommunicationEntry }) {
  if (entry.type === 'whatsapp') {
    return (
      <div className="-mx-2">
        <WhatsAppMessage
          content={entry.content}
          direction={entry.direction}
          timestamp={entry.timestamp}
          status={entry.status}
          senderName={entry.direction === 'inbound' ? entry.leadName : entry.userName}
          attachmentCount={entry.attachmentCount}
        />
      </div>
    )
  }

  return (
    <div className="ml-8">
      <div className={cn(
        "p-3 rounded-lg border",
        entry.direction === 'outbound' 
          ? "bg-violet-50 border-violet-200" 
          : "bg-gray-50 border-gray-200"
      )}>
        <p className="text-sm text-gray-800 leading-relaxed">
          {entry.content}
        </p>
        
        {entry.attachmentCount && entry.attachmentCount > 0 && (
          <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {entry.attachmentCount} anexo{entry.attachmentCount > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

function AISummaryEntryContent({ entry }: { entry: AISummaryEntry }) {
  return (
    <div className="ml-8">
      <AISummaryCompact 
        summary={entry.summary}
        confidence={entry.confidence}
      />
    </div>
  )
}

function LeadUpdateEntryContent({ entry }: { entry: LeadUpdateEntry }) {
  return (
    <div className="ml-8">
      <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
        <p className="text-sm text-gray-800">
          {entry.description}
        </p>
        <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
          <span className="font-medium">Alteração:</span>
          <code className="px-1 py-0.5 bg-white rounded text-red-600">
            {entry.oldValue}
          </code>
          <span>→</span>
          <code className="px-1 py-0.5 bg-white rounded text-green-600">
            {entry.newValue}
          </code>
        </div>
      </div>
    </div>
  )
}

function MeetingEntryContent({ entry }: { entry: MeetingEntry }) {
  return (
    <div className="ml-8">
      <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200">
        <h4 className="text-sm font-medium text-gray-900 mb-1">
          {entry.title}
        </h4>
        {entry.description && (
          <p className="text-sm text-gray-700 mb-2">
            {entry.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          {entry.duration && (
            <span>Duração: {entry.duration}min</span>
          )}
          {entry.outcome && (
            <span className="font-medium">Resultado: {entry.outcome}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function TimelineEntryComponent({ 
  entry, 
  showLeadContext, 
  onClick 
}: { 
  entry: TimelineEntry
  showLeadContext?: boolean
  onClick?: () => void 
}) {
  return (
    <div 
      className={cn(
        "relative pl-8 pb-6 transition-colors duration-200",
        onClick && "cursor-pointer hover:bg-gray-50/50 rounded-lg p-2 -m-2"
      )}
      onClick={onClick}
    >
      {/* Linha vertical da timeline */}
      <div className="absolute left-3 top-6 bottom-0 w-px bg-gray-200" />
      
      {/* Conteúdo da entrada */}
      <div>
        <TimelineEntryHeader 
          entry={entry} 
          showLeadContext={showLeadContext} 
        />
        
        {(entry.type === 'whatsapp' || entry.type === 'email' || entry.type === 'voip' || entry.type === 'note') && (
          <CommunicationEntryContent entry={entry as CommunicationEntry} />
        )}
        
        {entry.type === 'ai_summary' && (
          <AISummaryEntryContent entry={entry as AISummaryEntry} />
        )}
        
        {entry.type === 'lead_update' && (
          <LeadUpdateEntryContent entry={entry as LeadUpdateEntry} />
        )}
        
        {entry.type === 'meeting' && (
          <MeetingEntryContent entry={entry as MeetingEntry} />
        )}
      </div>
    </div>
  )
}

export function Timeline({ 
  entries, 
  className, 
  groupByDate = true, 
  showLeadContext = false,
  onEntryClick 
}: TimelineProps) {
  const sortedEntries = [...entries].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  )

  if (!groupByDate) {
    return (
      <div className={cn("space-y-1", className)}>
        {sortedEntries.map((entry) => (
          <TimelineEntryComponent
            key={entry.id}
            entry={entry}
            showLeadContext={showLeadContext}
            onClick={onEntryClick ? () => onEntryClick(entry) : undefined}
          />
        ))}
      </div>
    )
  }

  // Agrupar por data
  const entriesByDate = sortedEntries.reduce((groups, entry) => {
    const dateKey = format(entry.timestamp, 'yyyy-MM-dd')
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(entry)
    return groups
  }, {} as Record<string, TimelineEntry[]>)

  return (
    <div className={cn("space-y-6", className)}>
      {Object.entries(entriesByDate).map(([dateKey, dateEntries]) => (
        <div key={dateKey}>
          {/* Header da data */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm py-2 mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-gray-900">
                {format(new Date(dateKey), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </h3>
              <div className="flex-1 h-px bg-gray-200" />
              <Badge variant="secondary" className="text-xs">
                {dateEntries.length} atividade{dateEntries.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Entradas da data */}
          <div className="space-y-1">
            {dateEntries.map((entry) => (
              <TimelineEntryComponent
                key={entry.id}
                entry={entry}
                showLeadContext={showLeadContext}
                onClick={onEntryClick ? () => onEntryClick(entry) : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Componente para exibir estatísticas da timeline
export function TimelineStats({ 
  entries, 
  className 
}: { 
  entries: TimelineEntry[]
  className?: string 
}) {
  const stats = entries.reduce((acc, entry) => {
    acc.total++
    acc[entry.type] = (acc[entry.type] || 0) + 1
    return acc
  }, { total: 0 } as Record<string, number>)

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {Object.entries(entryConfig).map(([type, config]) => {
        const count = stats[type] || 0
        const Icon = config.icon
        
        return (
          <div key={type} className={cn(
            "p-3 rounded-lg border-2",
            config.bgColor,
            "border-current/20"
          )}>
            <div className="flex items-center gap-2 mb-1">
              <Icon className={cn("h-4 w-4", config.color)} />
              <span className="text-sm font-medium text-gray-900">
                {config.label}
              </span>
            </div>
            <p className={cn("text-lg font-semibold", config.color)}>
              {count}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export type { TimelineEntry, CommunicationEntry, AISummaryEntry, LeadUpdateEntry, MeetingEntry }