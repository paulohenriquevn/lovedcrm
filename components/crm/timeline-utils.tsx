/**
 * Timeline Utilities
 * Utility functions and handlers for timeline functionality
 */

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import {
  CommunicationEntryContent,
  AISummaryEntryContent,
  LeadUpdateEntryContent,
  MeetingEntryContent,
} from './timeline-content-components'
import { TimelineEntry, TimelineEntryHeader, entryConfig } from './timeline-entry-components'

export function EntryClickHandlers(onClick?: () => void): {
  handleClick: () => void
  handleKeyPress: (event: React.KeyboardEvent) => void
} {
  const handleClick = (): void => {
    if (onClick !== null && onClick !== undefined) {
      onClick()
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  return { handleClick, handleKeyPress }
}

export function EntryContentRenderer({ entry }: { entry: TimelineEntry }): React.ReactElement {
  const isCommunication =
    entry.type === 'whatsapp' ||
    entry.type === 'email' ||
    entry.type === 'voip' ||
    entry.type === 'note'

  if (isCommunication) {
    return <CommunicationEntryContent entry={entry} />
  }

  switch (entry.type) {
    case 'ai_summary': {
      return <AISummaryEntryContent entry={entry} />
    }
    case 'lead_update': {
      return <LeadUpdateEntryContent entry={entry} />
    }
    case 'meeting': {
      return <MeetingEntryContent entry={entry} />
    }
    default: {
      return <div />
    }
  }
}

export function TimelineEntryComponent({
  entry,
  showLeadContext,
  onClick,
}: {
  entry: TimelineEntry
  showLeadContext?: boolean
  onClick?: () => void
}): React.ReactElement {
  const { handleClick, handleKeyPress } = EntryClickHandlers(onClick)
  const isClickable = onClick !== null && onClick !== undefined

  return (
    <div
      className={cn(
        'relative pl-8 pb-6 transition-colors duration-200',
        isClickable && 'cursor-pointer hover:bg-gray-50/50 rounded-lg p-2 -m-2'
      )}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyPress : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {/* Linha vertical da timeline */}
      <div className="absolute left-3 top-6 bottom-0 w-px bg-gray-200" />

      {/* Conteúdo da entrada */}
      <div>
        <TimelineEntryHeader entry={entry} showLeadContext={showLeadContext} />
        <EntryContentRenderer entry={entry} />
      </div>
    </div>
  )
}

export function TimelineEntryList({
  entries,
  showLeadContext,
  onEntryClick,
}: {
  entries: TimelineEntry[]
  showLeadContext?: boolean
  onEntryClick?: (entry: TimelineEntry) => void
}): React.ReactElement {
  return (
    <div className="space-y-1">
      {entries.map(entry => (
        <TimelineEntryComponent
          key={entry.id}
          entry={entry}
          showLeadContext={showLeadContext}
          onClick={
            onEntryClick === null || onEntryClick === undefined
              ? undefined
              : () => onEntryClick(entry)
          }
        />
      ))}
    </div>
  )
}

export function DateGroupHeader({
  dateKey,
  entriesCount,
}: {
  dateKey: string
  entriesCount: number
}): React.ReactElement {
  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm py-2 mb-4">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-gray-900">
          {format(new Date(dateKey), "dd 'de' MMMM, yyyy", { locale: ptBR })}
        </h3>
        <div className="flex-1 h-px bg-gray-200" />
        <Badge variant="secondary" className="text-xs">
          {entriesCount} atividade{entriesCount === 1 ? '' : 's'}
        </Badge>
      </div>
    </div>
  )
}

// Componente para exibir estatísticas da timeline
export function TimelineStats({
  entries,
  className,
}: {
  entries: TimelineEntry[]
  className?: string
}): React.ReactElement {
  const stats: Record<string, number> = { total: 0 }
  for (const entry of entries) {
    stats.total = (stats.total ?? 0) + 1
    const currentCount = stats[entry.type] ?? 0
    stats[entry.type] = currentCount + 1
  }

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {Object.entries(entryConfig).map(([type, config]) => {
        const count = stats[type] ?? 0
        const Icon = config.icon

        return (
          <div
            key={type}
            className={cn('p-3 rounded-lg border-2', config.bgColor, 'border-current/20')}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className={cn('h-4 w-4', config.color)} />
              <span className="text-sm font-medium text-gray-900">{config.label}</span>
            </div>
            <p className={cn('text-lg font-semibold', config.color)}>{count}</p>
          </div>
        )
      })}
    </div>
  )
}

export type {
  TimelineEntry,
  CommunicationEntry,
  AISummaryEntry,
  LeadUpdateEntry,
  MeetingEntry,
} from './timeline-entry-components'
