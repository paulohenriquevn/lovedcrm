/**
 * Urgency Alert Item Parts
 * Extracted components to reduce AlertItem function size
 */
import { X, type LucideIcon } from 'lucide-react'

import { AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { ALERT_CONFIGS } from './urgency-alerts-config'

import type { UrgencyAlert } from './urgency-alerts-types'

interface AlertHeaderProps {
  alert: UrgencyAlert
  TypeIcon: LucideIcon
  SeverityIcon: LucideIcon
  severity: { iconClass: string }
  onDismiss: () => void
}

export function AlertHeader({
  alert,
  TypeIcon,
  SeverityIcon,
  severity,
  onDismiss,
}: AlertHeaderProps): React.ReactElement {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-2">
        <TypeIcon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', severity.iconClass)} />
        <div className="flex-1">
          <AlertTitle className="text-sm font-semibold mb-1">{alert.title}</AlertTitle>
          <AlertDescription className="text-sm">{alert.message}</AlertDescription>
        </div>
        <SeverityIcon className={cn('h-3 w-3 mt-1 flex-shrink-0', severity.iconClass)} />
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDismiss}
        className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Dismiss alert</span>
      </Button>
    </div>
  )
}

interface AlertActionsProps {
  alert: UrgencyAlert
  onAction: (actionType: string) => void
}

export function AlertActions({ alert, onAction }: AlertActionsProps): React.ReactElement | null {
  const config = ALERT_CONFIGS[alert.type]

  if (config.defaultActions === undefined || config.defaultActions.length === 0) {
    return null
  }

  return (
    <div className="flex gap-2 mt-3">
      {config.defaultActions.map(action => (
        <Button
          key={action.action}
          variant={action.variant || 'outline'}
          size="sm"
          onClick={() => onAction(action.action)}
          className="h-7 text-xs"
        >
          {action.label}
        </Button>
      ))}
    </div>
  )
}

interface AlertMetadataProps {
  alert: UrgencyAlert
}

export function AlertMetadata({ alert }: AlertMetadataProps): React.ReactElement | null {
  if (!alert.metadata || Object.keys(alert.metadata).length === 0) {
    return null
  }

  return (
    <div className="mt-2 pt-2 border-t border-border/50">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {Object.entries(alert.metadata).map(([key, value]) => (
          <span key={key}>
            <span className="font-medium">{key}:</span> {String(value)}
          </span>
        ))}
      </div>
    </div>
  )
}
