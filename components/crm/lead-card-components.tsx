/**
 * Lead Card Components
 * Individual components for rendering lead cards in the pipeline
 * Enhanced with micro-interactions and UX improvements
 */

import {
  Building2,
  Calendar,
  Clock,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Star,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Lead } from '@/services/crm-leads'

import { useLeadCardHandlers, LeadCardWrapper } from './lead-card-handlers'
import {
  STAGE_DISPLAY_CONFIG,
  getPriorityFromValue,
  getPriorityColor,
  getPriorityIcon,
  LeadValueDisplay,
  LeadNotesDisplay,
  LeadContactInfo,
  LeadTagsDisplay,
} from './lead-card-utils'
import { LeadScoreDisplay } from './lead-score-display'
import { useUXEnhancements, useEnhancedButton } from './pipeline-ux-enhancements'

function LeadCardHeader({
  lead,
  priority,
  onViewDetails,
  onEditLead,
  onSendEmail,
  onRemoveLead,
}: {
  lead: Lead
  priority: string
  onViewDetails: (lead: Lead) => void
  onEditLead: (lead: Lead) => void
  onSendEmail: (lead: Lead) => void
  onRemoveLead: (lead: Lead) => void
}): React.ReactElement {
  return (
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <h4
            className="font-semibold text-sm text-foreground truncate max-w-[200px]"
            title={lead.name}
          >
            {lead.name}
          </h4>
          {Boolean(lead.is_favorite) && (
            <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" />
          )}
        </div>
        {lead.source !== null && lead.source !== undefined && lead.source.length > 0 ? (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 min-w-0">
            <Building2 className="h-3 w-3 flex-shrink-0" />
            <span className="truncate max-w-[180px]" title={lead.source}>
              {lead.source}
            </span>
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {/* Lead Score Display */}
        {lead.lead_score !== null && lead.lead_score !== undefined && (
          <LeadScoreDisplay 
            score={lead.lead_score} 
            factors={lead.score_factors ?? {}}
            variant="badge"
            size="sm"
            showBreakdown
          />
        )}
        
        <div className={getPriorityColor(priority)}>{getPriorityIcon(priority)}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
              <span className="sr-only">Ações do lead</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(lead)}>Ver detalhes</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditLead(lead)}>Editar lead</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSendEmail(lead)}>Enviar email</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => onRemoveLead(lead)}>
              Remover lead
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function ValueSection({ lead }: { lead: Lead }): React.ReactElement | null {
  if (
    lead.estimated_value === null ||
    lead.estimated_value === undefined ||
    lead.estimated_value <= 0
  ) {
    return null
  }
  return <LeadValueDisplay value={lead.estimated_value} />
}

function NotesSection({ lead }: { lead: Lead }): React.ReactElement | null {
  if (lead.notes === null || lead.notes === undefined || lead.notes.length === 0) {
    return null
  }
  return <LeadNotesDisplay notes={lead.notes} />
}

function TagsSection({ lead }: { lead: Lead }): React.ReactElement | null {
  if (lead.tags === null || lead.tags === undefined || lead.tags.length === 0) {
    return null
  }
  return <LeadTagsDisplay tags={lead.tags} />
}

function LeadCardContent({ lead }: { lead: Lead }): React.ReactElement {
  return (
    <div>
      <ValueSection lead={lead} />
      <NotesSection lead={lead} />
      <LeadContactInfo lead={lead} />
      <TagsSection lead={lead} />
    </div>
  )
}

function LeadCardFooter({
  lead,
  onCall,
  onWhatsApp,
}: {
  lead: Lead
  onCall: (lead: Lead) => void
  onWhatsApp: (lead: Lead) => void
}): React.ReactElement {
  const { detectReducedMotion } = useUXEnhancements()
  const reducedMotion = detectReducedMotion()

  const callButton = useEnhancedButton({
    onClick: () => onCall(lead),
    hapticPattern: [25],
    reducedMotion,
  })

  const whatsAppButton = useEnhancedButton({
    onClick: () => onWhatsApp(lead),
    hapticPattern: [25],
    reducedMotion,
  })

  return (
    <div>
      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {STAGE_DISPLAY_CONFIG[lead.stage].name}
          </Badge>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            {lead.days_in_current_stage === null ? 'Novo' : `${lead.days_in_current_stage}d`}
          </span>
        </div>
      </div>

      {/* Last Contact */}
      {lead.last_contact_at !== null && lead.last_contact_at !== undefined && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
            <Calendar className="h-3 w-3" />
            <span>
              Último contato: {new Date(lead.last_contact_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      )}

      {/* Quick Actions with Enhanced UX */}
      <div className="mt-3 flex gap-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn('flex-1 h-7 text-xs', callButton.className)}
          onClick={callButton.handleClick}
        >
          <Phone className="mr-1 h-3 w-3" />
          Ligar
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn('flex-1 h-7 text-xs', whatsAppButton.className)}
          onClick={whatsAppButton.handleClick}
        >
          <MessageCircle className="mr-1 h-3 w-3" />
          WhatsApp
        </Button>
      </div>
    </div>
  )
}

export function LeadCard({
  lead,
  onDragStart,
  onViewDetails,
  onEditLead,
  onSendEmail,
  onRemoveLead,
  onCall,
  onWhatsApp,
  isDragging = false,
}: {
  lead: Lead
  onDragStart: (lead: Lead) => void
  onViewDetails: (lead: Lead) => void
  onEditLead: (lead: Lead) => void
  onSendEmail: (lead: Lead) => void
  onRemoveLead: (lead: Lead) => void
  onCall: (lead: Lead) => void
  onWhatsApp: (lead: Lead) => void
  isDragging?: boolean
}): React.ReactElement {
  const priority = getPriorityFromValue(lead.estimated_value)
  const { hoverClasses, detectReducedMotion } = useUXEnhancements()
  const reducedMotion = detectReducedMotion()
  const { handleDragStart, handleCardClick } = useLeadCardHandlers(lead, onDragStart, onViewDetails)

  return (
    <LeadCardWrapper
      reducedMotion={reducedMotion}
      hoverClasses={hoverClasses}
      isDragging={isDragging}
      onDragStart={handleDragStart}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <LeadCardHeader
          lead={lead}
          priority={priority}
          onViewDetails={onViewDetails}
          onEditLead={onEditLead}
          onSendEmail={onSendEmail}
          onRemoveLead={onRemoveLead}
        />
        <LeadCardContent lead={lead} />
        <div
          onClick={e => e.stopPropagation()}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation()
            }
          }}
          role="button"
          tabIndex={0}
        >
          <LeadCardFooter lead={lead} onCall={onCall} onWhatsApp={onWhatsApp} />
        </div>
      </CardContent>
    </LeadCardWrapper>
  )
}
