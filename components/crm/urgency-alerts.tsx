/**
 * Urgency Alert System
 * Contextual alerts for lead management with severity levels and inline actions
 * Features: Real-time urgency detection, smart scheduling, non-intrusive notifications
 * Story 3.3: Lead Management - Melhorias UX
 */
'use client'

import { CheckCircle } from 'lucide-react'
import { useState, useMemo, useCallback } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Lead } from '@/services/crm-leads'

import { AlertFilterButtons, AlertItem } from './urgency-alerts-components'
import { ALERT_CONFIGS } from './urgency-alerts-config'
import {
  analyzeLeadContact,
  createFollowUpAlert,
  createHighValueAlert,
  createScoreDropAlert,
  createStaleLeadAlert,
} from './urgency-alerts-utils'

import type { UrgencyAlert, UrgencyAlertsProps } from './urgency-alerts-types'

export { type UrgencyAlert, type UrgencyAlertsProps } from './urgency-alerts-types'

// Hook for managing alert dismissal logic
function useAlertDismiss(onAlertDismiss?: (alertId: string) => void): {
  dismissedAlerts: Set<string>
  handleDismiss: (alertId: string) => void
} {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  const handleDismiss = useCallback(
    (alertId: string): void => {
      setDismissedAlerts(prev => new Set(prev).add(alertId))
      if (onAlertDismiss) {
        onAlertDismiss(alertId)
      }
    },
    [onAlertDismiss]
  )

  return { dismissedAlerts, handleDismiss }
}

// Generate urgency alerts based on leads
function generateUrgencyAlerts(leads: Lead[]): UrgencyAlert[] {
  const alerts: UrgencyAlert[] = []

  leads.forEach(lead => {
    const { daysSinceContact } = analyzeLeadContact(lead)

    const scoreAlert = createScoreDropAlert(lead)
    const staleAlert = createStaleLeadAlert(lead, daysSinceContact)
    const valueAlert = createHighValueAlert(lead)
    const followUpAlert = createFollowUpAlert(lead, daysSinceContact)

    if (scoreAlert) {
      alerts.push(scoreAlert)
    }
    if (staleAlert) {
      alerts.push(staleAlert)
    }
    if (valueAlert) {
      alerts.push(valueAlert)
    }
    if (followUpAlert) {
      alerts.push(followUpAlert)
    }
  })

  // Sort by priority and timestamp
  return alerts.sort((a, b) => {
    const priorityDiff = ALERT_CONFIGS[b.type].priority - ALERT_CONFIGS[a.type].priority
    if (priorityDiff !== 0) {
      return priorityDiff
    }

    const aTime = a.timestamp?.getTime() ?? 0
    const bTime = b.timestamp?.getTime() ?? 0
    return bTime - aTime
  })
}

// Compact alert list for sidebar/header
export function UrgencyAlertsList({
  leads = [],
  className,
  maxAlerts = 5,
  onAlertAction,
  onAlertDismiss,
}: UrgencyAlertsProps): React.ReactElement {
  const { dismissedAlerts, handleDismiss } = useAlertDismiss(onAlertDismiss)

  const alerts = useMemo(() => {
    const generated = generateUrgencyAlerts(leads)
    return generated.filter(alert => !dismissedAlerts.has(alert.id)).slice(0, maxAlerts)
  }, [leads, dismissedAlerts, maxAlerts])

  if (alerts.length === 0) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">All leads up to date</span>
        </div>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {alerts.map(alert => (
        <AlertItem
          key={alert.id}
          alert={alert}
          onAction={onAlertAction}
          onDismiss={handleDismiss}
        />
      ))}

      {alerts.length >= maxAlerts && (
        <div className="text-center">
          <Button variant="ghost" size="sm" className="text-xs">
            View all alerts ({generateUrgencyAlerts(leads).length - dismissedAlerts.size} total)
          </Button>
        </div>
      )}
    </div>
  )
}

// Alert summary badge for navigation
export function UrgencyAlertsBadge({
  leads = [],
  className,
}: {
  leads?: Lead[]
  className?: string
}): React.ReactElement | null {
  const alertData = useMemo(() => {
    const alerts = generateUrgencyAlerts(leads)
    const count = alerts.length
    const hasHighPriority = alerts.some(
      alert =>
        alert.severity === 'error' ||
        (alert.severity === 'warning' && ['scoreDrop', 'highValue'].includes(alert.type))
    )
    return { count, hasHighPriority }
  }, [leads])

  if (alertData.count === 0) {
    return null
  }

  return (
    <Badge
      variant={alertData.hasHighPriority ? 'destructive' : 'secondary'}
      className={cn('animate-pulse', className)}
    >
      {alertData.count}
    </Badge>
  )
}

// Full-featured alerts panel
export function UrgencyAlertsPanel({
  leads = [],
  className,
  onAlertAction,
  onAlertDismiss,
}: UrgencyAlertsProps): React.ReactElement {
  const { dismissedAlerts, handleDismiss } = useAlertDismiss(onAlertDismiss)
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all')

  const alerts = useMemo(() => {
    const generated = generateUrgencyAlerts(leads)
    return generated
      .filter(alert => !dismissedAlerts.has(alert.id))
      .filter(alert => filter === 'all' || alert.severity === filter)
  }, [leads, dismissedAlerts, filter])

  const alertCounts = useMemo(() => {
    const all = generateUrgencyAlerts(leads).filter(alert => !dismissedAlerts.has(alert.id))
    return {
      all: all.length,
      error: all.filter(a => a.severity === 'error').length,
      warning: all.filter(a => a.severity === 'warning').length,
      info: all.filter(a => a.severity === 'info').length,
    }
  }, [leads, dismissedAlerts])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Urgency Alerts</span>
          <Badge variant="secondary">{alertCounts.all}</Badge>
        </CardTitle>

        <AlertFilterButtons
          selectedSeverity={filter === 'all' ? undefined : filter}
          onSeverityChange={severity =>
            setFilter((severity as 'error' | 'all' | 'warning' | 'info') || 'all')
          }
        />
      </CardHeader>

      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
            <p>No {filter === 'all' ? '' : filter} alerts</p>
          </div>
        ) : (
          alerts.map(alert => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onAction={onAlertAction}
              onDismiss={handleDismiss}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

export { generateUrgencyAlerts }
// Named export only - no default export
