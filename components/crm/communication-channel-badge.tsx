/**
 * Communication Channel Badge Component
 * Badge component for different communication channels
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { communicationChannelLabels } from '@/types/design-tokens'

import {
  channelConfig,
  statusConfig,
  CommunicationChannelBadgeProps,
} from './communication-channel-config'

export function CommunicationChannelBadge({
  channel,
  status,
  className,
  showLabel = false,
}: CommunicationChannelBadgeProps): React.ReactElement {
  const config = channelConfig[channel]
  const Icon = config.icon
  const StatusIcon = status === null || status === undefined ? null : statusConfig[status].icon

  return (
    <Badge
      variant="secondary"
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium border',
        config.styles,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {showLabel ? communicationChannelLabels[channel] : null}
      {StatusIcon && status ? (
        <StatusIcon className={cn('h-3 w-3', statusConfig[status].color)} />
      ) : null}
    </Badge>
  )
}
