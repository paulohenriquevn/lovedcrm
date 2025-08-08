/**
 * Timeline Content Components
 * Content rendering components for different timeline entry types
 */

import { FileText } from "lucide-react"

import { cn } from "@/lib/utils"

import { AISummaryCompact } from "./ai-summary"
import { WhatsAppMessage } from "./communication-channel"

import type { 
  CommunicationEntry, 
  AISummaryEntry, 
  LeadUpdateEntry, 
  MeetingEntry 
} from "./timeline-entry-components"

export function CommunicationEntryContent({ entry }: { entry: CommunicationEntry }): React.ReactElement {
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
        
        {entry.attachmentCount !== null && entry.attachmentCount !== undefined && entry.attachmentCount > 0 ? <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {entry.attachmentCount} anexo{entry.attachmentCount > 1 ? 's' : ''}
          </div> : null}
      </div>
    </div>
  )
}

export function AISummaryEntryContent({ entry }: { entry: AISummaryEntry }): React.ReactElement {
  return (
    <div className="ml-8">
      <AISummaryCompact 
        summary={entry.summary}
        confidence={entry.confidence}
      />
    </div>
  )
}

export function LeadUpdateEntryContent({ entry }: { entry: LeadUpdateEntry }): React.ReactElement {
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

function MeetingDescription({ description }: { description?: string }): React.ReactElement | null {
  if (description === null || description === undefined || description.length === 0) {
    return null
  }
  
  return (
    <p className="text-sm text-gray-700 mb-2">
      {description}
    </p>
  )
}

function MeetingDuration({ duration }: { duration?: number }): React.ReactElement | null {
  if (duration === null || duration === undefined || duration <= 0) {
    return null
  }
  
  return <span>Duração: {duration}min</span>
}

function MeetingOutcome({ outcome }: { outcome?: string }): React.ReactElement | null {
  if (outcome === null || outcome === undefined || outcome.length === 0) {
    return null
  }
  
  return <span className="font-medium">Resultado: {outcome}</span>
}

function MeetingMetadata({ entry }: { entry: MeetingEntry }): React.ReactElement | null {
  const hasDuration = entry.duration !== null && entry.duration !== undefined && entry.duration > 0
  const hasOutcome = entry.outcome !== null && entry.outcome !== undefined && entry.outcome.length > 0
  
  if (!hasDuration && !hasOutcome) {
    return null
  }
  
  return (
    <div className="flex items-center gap-4 text-xs text-gray-600">
      <MeetingDuration duration={entry.duration} />
      <MeetingOutcome outcome={entry.outcome} />
    </div>
  )
}

export function MeetingEntryContent({ entry }: { entry: MeetingEntry }): React.ReactElement {
  return (
    <div className="ml-8">
      <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200">
        <h4 className="text-sm font-medium text-gray-900 mb-1">
          {entry.title}
        </h4>
        <MeetingDescription description={entry.description} />
        <MeetingMetadata entry={entry} />
      </div>
    </div>
  )
}