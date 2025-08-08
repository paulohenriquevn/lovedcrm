/**
 * Message Bubble Sub-components
 * Extracted components for better organization
 */

import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { CommunicationChannelBadge } from './communication-channel-badge'
import { CommunicationChannel, MessageStatus, statusConfig } from './communication-channel-config'

export function MessageBubbleHeader({
  isOutbound,
  senderName,
  channel,
  onMenuClick,
}: {
  isOutbound: boolean
  senderName?: string
  channel: CommunicationChannel
  onMenuClick?: () => void
}): React.ReactElement {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        {!isOutbound && senderName !== null && senderName !== undefined && senderName.length > 0 ? (
          <span className="text-xs font-medium opacity-75">{senderName}</span>
        ) : null}
        <CommunicationChannelBadge channel={channel} className="scale-75 origin-left" />
      </div>
      {onMenuClick === null || onMenuClick === undefined ? null : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onMenuClick}
        >
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

// Helper component to render status indicator
export function StatusIndicator({
  status,
  StatusIcon,
  isOutbound,
}: {
  status: MessageStatus
  StatusIcon: React.ComponentType<{ className?: string }>
  isOutbound: boolean
}): React.ReactElement {
  return (
    <div className="flex items-center gap-1">
      <StatusIcon
        className={cn('h-3 w-3', isOutbound ? 'text-white/70' : statusConfig[status].color)}
      />
      <span className={cn('text-xs', isOutbound ? 'text-white/70' : 'opacity-75')}>
        {statusConfig[status].label}
      </span>
    </div>
  )
}

export function MessageBubbleFooter({
  timestamp,
  status,
  isOutbound,
}: {
  timestamp: Date
  status?: MessageStatus
  isOutbound: boolean
}): React.ReactElement {
  const StatusIcon = status ? statusConfig[status].icon : null

  return (
    <div className="flex items-center justify-between mt-3 pt-2 border-t border-current/10">
      <time className="text-xs opacity-75" title={timestamp.toLocaleString('pt-BR')}>
        {formatDistanceToNow(timestamp, {
          addSuffix: true,
          locale: ptBR,
        })}
      </time>

      {status && StatusIcon ? (
        <StatusIndicator status={status} StatusIcon={StatusIcon} isOutbound={isOutbound} />
      ) : null}
    </div>
  )
}
