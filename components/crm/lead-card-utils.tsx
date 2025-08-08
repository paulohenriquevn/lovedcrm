/**
 * Lead Card Utilities
 * Utility functions and smaller components for lead cards
 */

import { Clock, DollarSign, Mail, Phone, Star } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Lead, PipelineStage } from '@/services/crm-leads'

export const STAGE_DISPLAY_CONFIG: Record<PipelineStage, { name: string; color: string }> = {
  [PipelineStage.LEAD]: {
    name: 'Lead',
    color: 'bg-muted/50 border-border',
  },
  [PipelineStage.CONTATO]: {
    name: 'Contato',
    color: 'bg-blue-500/10 border-blue-500/20',
  },
  [PipelineStage.PROPOSTA]: {
    name: 'Proposta',
    color: 'bg-yellow-500/10 border-yellow-500/20',
  },
  [PipelineStage.NEGOCIACAO]: {
    name: 'Negociação',
    color: 'bg-orange-500/10 border-orange-500/20',
  },
  [PipelineStage.FECHADO]: {
    name: 'Fechado',
    color: 'bg-emerald-500/10 border-emerald-500/20',
  },
}

export const getPriorityFromValue = (value?: number): 'low' | 'medium' | 'high' => {
  if (value === null || value === undefined || value === 0) {
    return 'low'
  }
  if (value >= 10_000) {
    return 'high'
  }
  if (value >= 5000) {
    return 'medium'
  }
  return 'low'
}

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high': {
      return 'text-red-600 dark:text-red-400'
    }
    case 'medium': {
      return 'text-yellow-600 dark:text-yellow-400'
    }
    case 'low': {
      return 'text-emerald-600 dark:text-emerald-400'
    }
    default: {
      return 'text-muted-foreground'
    }
  }
}

export const getPriorityIcon = (priority: string): React.ReactNode => {
  switch (priority) {
    case 'high': {
      return <Clock className="h-3 w-3" />
    }
    case 'medium': {
      return <Clock className="h-3 w-3" />
    }
    case 'low': {
      return <Star className="h-3 w-3" />
    }
    default: {
      return null
    }
  }
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function LeadValueDisplay({ value }: { value: number }): React.ReactElement {
  return (
    <div className="flex items-center gap-1 mb-2">
      <DollarSign className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
        {formatCurrency(value)}
      </span>
    </div>
  )
}

export function LeadNotesDisplay({ notes }: { notes: string }): React.ReactElement {
  return (
    <p
      className="text-xs text-muted-foreground mb-3 break-words overflow-hidden"
      title={notes}
      style={{
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}
    >
      {notes}
    </p>
  )
}

export function LeadContactInfo({ lead }: { lead: Lead }): React.ReactElement {
  return (
    <div className="space-y-1 mb-3">
      {lead.email !== null && lead.email !== undefined && lead.email.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
          <Mail className="h-3 w-3 flex-shrink-0" />
          <span className="truncate max-w-[180px]" title={lead.email}>
            {lead.email}
          </span>
        </div>
      )}
      {lead.phone !== null && lead.phone !== undefined && lead.phone.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
          <Phone className="h-3 w-3 flex-shrink-0" />
          <span className="truncate max-w-[180px]" title={lead.phone}>
            {lead.phone}
          </span>
        </div>
      )}
    </div>
  )
}

export function LeadTagsDisplay({ tags }: { tags: string[] }): React.ReactElement {
  return (
    <div className="flex flex-wrap gap-1 mb-3">
      {tags.slice(0, 3).map(tag => (
        <Badge key={tag} variant="outline" className="text-xs truncate max-w-[80px]" title={tag}>
          {tag}
        </Badge>
      ))}
      {tags.length > 3 && (
        <Badge
          variant="secondary"
          className="text-xs cursor-default flex-shrink-0"
          title={`Mais ${tags.length - 3} tags: ${tags.slice(3).join(', ')}`}
        >
          +{tags.length - 3}
        </Badge>
      )}
    </div>
  )
}
