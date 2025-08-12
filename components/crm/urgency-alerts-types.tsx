/**
 * Urgency Alerts Types
 * Type definitions for urgency alert system
 */
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'

import { Lead } from '@/services/crm-leads'

export interface UrgencyAlert {
  id: string
  leadId: string
  type: 'scoreDrop' | 'staleLead' | 'highValue' | 'followUp'
  severity: 'info' | 'warning' | 'error'
  message: string
  description?: string
  action?: () => void
  actionLabel?: string
  dismissible?: boolean
  timestamp?: Date
  metadata?: Record<string, unknown>
  title?: string
}

export interface UrgencyAlertsProps {
  leads?: Lead[]
  className?: string
  maxAlerts?: number
  onAlertAction?: (alert: UrgencyAlert, actionType: string) => void
  onAlertDismiss?: (alertId: string) => void
}

// Alert severity styling
export const getSeverityStyle = (
  severity: UrgencyAlert['severity']
): {
  containerClass: string
  iconClass: string
  textClass: string
  icon: typeof AlertCircle
} => {
  switch (severity) {
    case 'error': {
      return {
        containerClass: 'border-red-200 bg-red-50',
        iconClass: 'text-red-600',
        textClass: 'text-red-800',
        icon: AlertCircle,
      }
    }
    case 'warning': {
      return {
        containerClass: 'border-yellow-200 bg-yellow-50',
        iconClass: 'text-yellow-600',
        textClass: 'text-yellow-800',
        icon: AlertTriangle,
      }
    }
    default: {
      return {
        containerClass: 'border-blue-200 bg-blue-50',
        iconClass: 'text-blue-600',
        textClass: 'text-blue-800',
        icon: Info,
      }
    }
  }
}
