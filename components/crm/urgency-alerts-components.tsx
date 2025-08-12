/**
 * Simplified Urgency Alerts Components
 * Reduced function size version to pass linting
 */
'use client'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { ALERT_CONFIGS } from './urgency-alerts-config'
import { AlertHeader, AlertActions, AlertMetadata } from './urgency-alerts-item-parts'
import { getSeverityStyle, UrgencyAlert } from './urgency-alerts-types'

// Individual alert component - simplified
export function AlertItem({
  alert,
  onAction,
  onDismiss,
}: {
  alert: UrgencyAlert
  onAction?: (alert: UrgencyAlert, actionType: string) => void
  onDismiss?: (alertId: string) => void
}): React.ReactElement {
  const severity = getSeverityStyle(alert.severity)
  const config = ALERT_CONFIGS[alert.type]
  const TypeIcon = config.icon
  const SeverityIcon = severity.icon

  const handleAction = (actionType: string): void => {
    if (onAction) {
      onAction(alert, actionType)
    }
  }

  const handleDismiss = (): void => {
    if (onDismiss) {
      onDismiss(alert.id)
    }
  }

  return (
    <Alert className={cn('relative', severity.containerClass)}>
      <AlertHeader
        alert={alert}
        TypeIcon={TypeIcon}
        SeverityIcon={SeverityIcon}
        severity={severity}
        onDismiss={handleDismiss}
      />

      <AlertActions alert={alert} onAction={handleAction} />

      <AlertMetadata alert={alert} />
    </Alert>
  )
}

// Alert filter buttons component
export function AlertFilterButtons({
  selectedSeverity,
  onSeverityChange,
  selectedTypes,
  onTypesChange,
}: {
  selectedSeverity?: string
  onSeverityChange?: (severity: string | undefined) => void
  selectedTypes?: string[]
  onTypesChange?: (types: string[]) => void
}): React.ReactElement {
  const severityOptions = [
    { value: 'high', label: 'High', variant: 'destructive' as const },
    { value: 'medium', label: 'Medium', variant: 'default' as const },
    { value: 'low', label: 'Low', variant: 'outline' as const },
  ]

  const typeOptions = Object.entries(ALERT_CONFIGS).map(([key, config]) => ({
    value: key,
    label: config.title,
  }))

  const handleSeverityClick = (severity: string): void => {
    if (onSeverityChange) {
      onSeverityChange(selectedSeverity === severity ? undefined : severity)
    }
  }

  const handleTypeClick = (type: string): void => {
    if (onTypesChange) {
      const currentTypes = selectedTypes ?? []
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter(t => t !== type)
        : [...currentTypes, type]
      onTypesChange(newTypes)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex gap-1">
        <span className="text-sm text-muted-foreground self-center mr-2">Severity:</span>
        {severityOptions.map(option => (
          <Button
            key={option.value}
            variant={selectedSeverity === option.value ? option.variant : 'outline'}
            size="sm"
            onClick={() => handleSeverityClick(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="flex gap-1">
        <span className="text-sm text-muted-foreground self-center mr-2">Type:</span>
        {typeOptions.map(option => (
          <Button
            key={option.value}
            variant={(selectedTypes?.includes(option.value) ?? false) ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeClick(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
