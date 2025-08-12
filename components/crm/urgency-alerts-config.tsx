/**
 * Urgency Alerts Configuration
 * Configuration data for different alert types
 */
import { AlertCircle, Clock, DollarSign, MessageSquare, TrendingDown } from 'lucide-react'

import { UrgencyAlert } from './urgency-alerts-types'

// Alert type configurations
export const ALERT_CONFIGS: Record<
  UrgencyAlert['type'],
  {
    icon: typeof AlertCircle
    title: string
    priority: number
    defaultActions: Array<{
      label: string
      variant: 'default' | 'outline' | 'secondary'
      action: string
    }>
  }
> = {
  scoreDrop: {
    icon: TrendingDown,
    title: 'Score Drop',
    priority: 3,
    defaultActions: [
      { label: 'Review Lead', variant: 'outline', action: 'review' },
      { label: 'Contact Now', variant: 'default', action: 'contact' },
    ],
  },
  staleLead: {
    icon: Clock,
    title: 'Stale Lead',
    priority: 2,
    defaultActions: [
      { label: 'Schedule Call', variant: 'outline', action: 'schedule' },
      { label: 'Send Email', variant: 'outline', action: 'email' },
    ],
  },
  highValue: {
    icon: DollarSign,
    title: 'High Value',
    priority: 4,
    defaultActions: [
      { label: 'Assign Senior', variant: 'default', action: 'assign' },
      { label: 'Priority Call', variant: 'default', action: 'priority_call' },
    ],
  },
  followUp: {
    icon: MessageSquare,
    title: 'Follow Up',
    priority: 1,
    defaultActions: [
      { label: 'Follow Up', variant: 'outline', action: 'follow_up' },
      { label: 'Reschedule', variant: 'outline', action: 'reschedule' },
    ],
  },
}
