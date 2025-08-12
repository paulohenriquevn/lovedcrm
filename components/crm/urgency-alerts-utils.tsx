/**
 * Urgency Alerts Utils
 * Utility functions for urgency alert system
 */
import { Lead } from '@/services/crm-leads'

import { UrgencyAlert } from './urgency-alerts-types'

// Helper function for lead contact analysis
export function analyzeLeadContact(lead: Lead): {
  lastContact: Date | null
  daysSinceContact: number | null
} {
  const lastContact =
    lead.last_contact_at === null || lead.last_contact_at === undefined
      ? null
      : new Date(lead.last_contact_at)
  const daysSinceContact = lastContact
    ? Math.floor((Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
    : null
  return { lastContact, daysSinceContact }
}

// Helper function to create score drop alerts
export function createScoreDropAlert(lead: Lead): UrgencyAlert | null {
  if (typeof lead.lead_score === 'number' && lead.lead_score < 40) {
    return {
      id: `score_drop_${lead.id}`,
      leadId: lead.id,
      type: 'scoreDrop',
      severity: 'warning',
      message: `${lead.name} score dropped to ${lead.lead_score}`,
      description: 'Low score indicates reduced conversion probability',
      timestamp: new Date(),
      dismissible: true,
    }
  }
  return null
}

// Helper function to create stale lead alerts
export function createStaleLeadAlert(
  lead: Lead,
  daysSinceContact: number | null
): UrgencyAlert | null {
  if (daysSinceContact !== null && daysSinceContact > 7) {
    return {
      id: `stale_${lead.id}`,
      leadId: lead.id,
      type: 'staleLead',
      severity: daysSinceContact > 14 ? 'error' : 'warning',
      message: `${lead.name} - ${daysSinceContact} days without contact`,
      description: 'Lead may lose interest without regular engagement',
      timestamp: new Date(),
      dismissible: true,
    }
  }
  return null
}

// Helper function to create high value alerts
export function createHighValueAlert(lead: Lead): UrgencyAlert | null {
  const estimatedValue = lead.estimated_value ?? 0
  if (estimatedValue > 50_000) {
    return {
      id: `high_value_${lead.id}`,
      leadId: lead.id,
      type: 'highValue',
      severity: 'info',
      message: `High-value lead: ${lead.name} (R$${estimatedValue.toLocaleString()})`,
      description: 'Assign to senior team member for priority handling',
      timestamp: new Date(),
      dismissible: true,
    }
  }
  return null
}

// Helper function to create follow-up alerts
export function createFollowUpAlert(
  lead: Lead,
  daysSinceContact: number | null
): UrgencyAlert | null {
  if (
    ['proposta', 'negociacao'].includes(lead.stage) &&
    daysSinceContact !== null &&
    daysSinceContact > 3
  ) {
    return {
      id: `follow_up_${lead.id}`,
      leadId: lead.id,
      type: 'followUp',
      severity: 'warning',
      message: `Follow-up needed: ${lead.name}`,
      description: `Lead in ${lead.stage} stage needs regular follow-up`,
      timestamp: new Date(),
      dismissible: true,
    }
  }
  return null
}
