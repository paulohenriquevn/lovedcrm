/**
 * Lead Card Header Components
 * Header section components for lead cards
 */
import { Building2, CheckSquare, MoreHorizontal, Square, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Lead } from '@/services/crm-leads'

import { EnhancedLeadScoreDisplay } from './enhanced-lead-score-display'
import { getPriorityColor, getPriorityIcon } from './lead-card-utils'

// Selection checkbox component
export function SelectionCheckbox({
  lead,
  isSelected,
  onToggleSelection,
}: {
  lead: Lead
  isSelected: boolean
  onToggleSelection: (leadId: string) => void
}): React.ReactElement {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0 mt-0.5 hover:bg-transparent"
      onClick={e => {
        e.stopPropagation()
        onToggleSelection(lead.id)
      }}
    >
      {isSelected ? (
        <CheckSquare className="h-4 w-4 text-blue-600" />
      ) : (
        <Square className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      )}
      <span className="sr-only">{isSelected ? 'Deselect lead' : 'Select lead'}</span>
    </Button>
  )
}

// Lead name and source section
export function LeadNameSection({ lead }: { lead: Lead }): React.ReactElement {
  return (
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
      {Boolean(lead.source && lead.source.length > 0) && (
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 min-w-0">
          <Building2 className="h-3 w-3 flex-shrink-0" />
          <span className="truncate max-w-[180px]" title={lead.source}>
            {lead.source}
          </span>
        </p>
      )}
    </div>
  )
}

// Score and priority display section
export function ScorePrioritySection({
  lead,
  priority,
}: {
  lead: Lead
  priority: string
}): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      {/* Enhanced Lead Score Display */}
      {lead.lead_score !== null && lead.lead_score !== undefined && (
        <EnhancedLeadScoreDisplay
          leadId={lead.id}
          score={lead.lead_score}
          factors={lead.score_factors ?? {}}
          variant="badge"
          showBreakdown
        />
      )}
      <div className={getPriorityColor(priority)}>{getPriorityIcon(priority)}</div>
    </div>
  )
}

// Actions dropdown menu
export function ActionsDropdown({
  lead,
  onViewDetails,
  onEditLead,
  onSendEmail,
  onRemoveLead,
}: {
  lead: Lead
  onViewDetails: (lead: Lead) => void
  onEditLead: (lead: Lead) => void
  onSendEmail: (lead: Lead) => void
  onRemoveLead: (lead: Lead) => void
}): React.ReactElement {
  return (
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
  )
}
