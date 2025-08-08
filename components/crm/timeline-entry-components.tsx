/**
 * Timeline Entry Components
 * Individual component pieces for timeline entries
 */

import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  MessageCircle,
  Mail,
  Phone,
  FileText,
  Sparkles,
  User,
  Calendar,
  TrendingUp
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Content components are imported from timeline-content-components

export type TimelineEntryType = 'whatsapp' | 'email' | 'voip' | 'note' | 'ai_summary' | 'lead_update' | 'meeting'

export interface BaseTimelineEntry {
  id: string
  type: TimelineEntryType
  timestamp: Date
  leadId?: string
  leadName?: string
  userId?: string
  userName?: string
}

export interface CommunicationEntry extends BaseTimelineEntry {
  type: 'whatsapp' | 'email' | 'voip' | 'note'
  content: string
  direction: 'inbound' | 'outbound'
  status?: 'sent' | 'delivered' | 'read' | 'failed'
  attachmentCount?: number
}

export interface AISummaryEntry extends BaseTimelineEntry {
  type: 'ai_summary'
  summary: string
  confidence?: number
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed'
}

export interface LeadUpdateEntry extends BaseTimelineEntry {
  type: 'lead_update'
  field: string
  oldValue: string
  newValue: string
  description: string
}

export interface MeetingEntry extends BaseTimelineEntry {
  type: 'meeting'
  title: string
  description?: string
  duration?: number
  outcome?: string
}

export type TimelineEntry = CommunicationEntry | AISummaryEntry | LeadUpdateEntry | MeetingEntry

export const entryConfig = {
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
  aiSummary: {
    icon: Sparkles,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    label: 'Resumo IA'
  },
  leadUpdate: {
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

// Helper function to map entry types to config keys
export const getConfigKey = (entryType: TimelineEntryType): string => {
  switch (entryType) {
    case 'ai_summary': {
      return 'aiSummary'
    }
    case 'lead_update': {
      return 'leadUpdate'
    }
    default: {
      return entryType
    }
  }
}

export function EntryIcon({ 
  config 
}: { 
  config: { icon: React.ComponentType<{ className?: string }>, color: string, bgColor: string } 
}): React.ReactElement {
  const Icon = config.icon
  return (
    <div className={cn(
      "flex items-center justify-center h-6 w-6 rounded-full",
      config.bgColor
    )}>
      <Icon className={cn("h-3 w-3", config.color)} />
    </div>
  )
}

function CommunicationBadge({ entry }: { entry: TimelineEntry }): React.ReactElement | null {
  const isCommunicationEntry = entry.type === 'whatsapp' || entry.type === 'email' || entry.type === 'voip' || entry.type === 'note'
  
  if (!isCommunicationEntry) {
    return null
  }
  
  return (
    <Badge variant="outline" className="text-xs">
      {(entry).direction === 'inbound' ? 'Recebido' : 'Enviado'}
    </Badge>
  )
}

function LeadContextBadge({ 
  entry, 
  showLeadContext 
}: { 
  entry: TimelineEntry
  showLeadContext?: boolean 
}): React.ReactElement | null {
  const hasLeadName = entry.leadName !== null && entry.leadName !== undefined && entry.leadName.length > 0
  
  if (showLeadContext !== true || !hasLeadName) {
    return null
  }
  
  return (
    <Badge variant="secondary" className="text-xs">
      <User className="h-3 w-3 mr-1" />
      {entry.leadName}
    </Badge>
  )
}

export function EntryBadges({ 
  entry, 
  showLeadContext,
  config 
}: { 
  entry: TimelineEntry
  showLeadContext?: boolean
  config: { label: string }
}): React.ReactElement {
  return (
    <div className="flex items-center gap-2 flex-1">
      <span className="text-sm font-medium text-gray-900">
        {config.label}
      </span>
      <CommunicationBadge entry={entry} />
      <LeadContextBadge entry={entry} showLeadContext={showLeadContext} />
    </div>
  )
}

export function TimelineEntryHeader({ 
  entry, 
  showLeadContext 
}: { 
  entry: TimelineEntry
  showLeadContext?: boolean 
}): React.ReactElement {
  const configKey = getConfigKey(entry.type)
  const config = entryConfig[configKey as keyof typeof entryConfig]

  return (
    <div className="flex items-center gap-2 mb-2">
      <EntryIcon config={config} />
      <EntryBadges entry={entry} showLeadContext={showLeadContext} config={config} />
      <time className="text-xs text-gray-500" title={entry.timestamp.toLocaleString('pt-BR')}>
        {formatDistanceToNow(entry.timestamp, { 
          addSuffix: true, 
          locale: ptBR 
        })}
      </time>
    </div>
  )
}

// Content components are now exported from timeline-content-components.tsx
// This helps keep the file under the 300 line limit