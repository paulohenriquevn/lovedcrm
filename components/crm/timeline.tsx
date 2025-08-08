/**
 * Timeline Component
 * Timeline unificada para todas as comunicações e atividades do CRM
 * Baseado na especificação do agente 07-design-tokens.md
 */

import { format } from 'date-fns'

import { cn } from '@/lib/utils'

import { TimelineEntry } from './timeline-entry-components'
import { TimelineEntryList, DateGroupHeader } from './timeline-utils'

interface TimelineProps {
  entries: TimelineEntry[]
  className?: string
  groupByDate?: boolean
  showLeadContext?: boolean
  onEntryClick?: (entry: TimelineEntry) => void
}

export function Timeline({
  entries,
  className,
  groupByDate = true,
  showLeadContext = false,
  onEntryClick,
}: TimelineProps): React.ReactElement {
  const sortedEntries = [...entries].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  if (!groupByDate) {
    return (
      <div className={cn('space-y-1', className)}>
        <TimelineEntryList
          entries={sortedEntries}
          showLeadContext={showLeadContext}
          onEntryClick={onEntryClick}
        />
      </div>
    )
  }

  // Agrupar por data
  const entriesByDate: Record<string, TimelineEntry[]> = {}
  for (const entry of sortedEntries) {
    const dateKey = format(entry.timestamp, 'yyyy-MM-dd')
    if (entriesByDate[dateKey] === undefined) {
      entriesByDate[dateKey] = []
    }
    entriesByDate[dateKey].push(entry)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {Object.entries(entriesByDate).map(([dateKey, dateEntries]) => (
        <div key={dateKey}>
          <DateGroupHeader dateKey={dateKey} entriesCount={dateEntries.length} />

          <TimelineEntryList
            entries={dateEntries}
            showLeadContext={showLeadContext}
            onEntryClick={onEntryClick}
          />
        </div>
      ))}
    </div>
  )
}

export { TimelineStats } from './timeline-utils'
export type {
  TimelineEntry,
  CommunicationEntry,
  AISummaryEntry,
  LeadUpdateEntry,
  MeetingEntry,
} from './timeline-entry-components'
