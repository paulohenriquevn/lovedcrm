/**
 * Pipeline Kanban Stage Components
 * Individual stage components for pipeline kanban
 */
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Lead } from '@/services/crm-leads'

import { LeadCard } from './lead-card-components'
import { PipelineStageDisplay } from './pipeline-types'

export function StageHeader({
  stage,
  onAddLead,
}: {
  stage: PipelineStageDisplay
  onAddLead: () => void
}): React.ReactElement {
  return (
    <Card className={cn('mb-4', stage.color)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {stage.count}
            </Badge>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onAddLead}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Adicionar lead</span>
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}

export function AddLeadCard({ onAddLead }: { onAddLead: () => void }): React.ReactElement {
  return (
    <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
      <CardContent className="p-6 text-center">
        <Button
          type="button"
          variant="ghost"
          className="h-auto p-2 text-muted-foreground hover:text-primary"
          onClick={onAddLead}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Lead
        </Button>
      </CardContent>
    </Card>
  )
}

export function StageLeadsList({
  leads,
  onDragStart,
  onViewDetails,
  onEditLead,
  onSendEmail,
  onRemoveLead,
  onCall,
  onWhatsApp,
  draggedLead,
  reducedMotion,
  selectedLeadIds = [],
  onToggleSelection,
}: {
  leads: Lead[]
  onDragStart: (lead: Lead) => void
  onViewDetails: (lead: Lead) => void
  onEditLead: (lead: Lead) => void
  onSendEmail: (lead: Lead) => void
  onRemoveLead: (lead: Lead) => void
  onCall: (lead: Lead) => void
  onWhatsApp: (lead: Lead) => void
  draggedLead: Lead | null
  reducedMotion: boolean
  selectedLeadIds?: string[]
  onToggleSelection?: (leadId: string) => void
}): React.ReactElement {
  return (
    <>
      {leads.map((lead, index) => (
        <motion.div
          key={lead.id}
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.15,
            delay: reducedMotion ? 0 : index * 0.05,
          }}
        >
          <LeadCard
            lead={lead}
            onDragStart={onDragStart}
            onViewDetails={onViewDetails}
            onEditLead={onEditLead}
            onSendEmail={onSendEmail}
            onRemoveLead={onRemoveLead}
            onCall={onCall}
            onWhatsApp={onWhatsApp}
            isDragging={draggedLead?.id === lead.id}
            isSelected={selectedLeadIds.includes(lead.id)}
            onToggleSelection={onToggleSelection}
          />
        </motion.div>
      ))}
    </>
  )
}

export function StageDropZone({
  isDropZoneActive,
  reducedMotion,
  onDragEnter,
  onDragLeave,
  onDrop,
  children,
}: {
  isDropZoneActive: boolean
  reducedMotion: boolean
  onDragEnter: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  children: React.ReactNode
}): React.ReactElement {
  return (
    <motion.div
      className={cn(
        'w-[320px] flex-shrink-0 transition-all duration-200',
        isDropZoneActive && 'drop-zone-active',
        reducedMotion ? '' : isDropZoneActive && 'animate-pulse'
      )}
      animate={
        reducedMotion || !isDropZoneActive
          ? {}
          : {
              borderColor: 'hsl(var(--sector-primary) / 0.5)',
              backgroundColor: 'hsl(var(--sector-primary) / 0.05)',
            }
      }
      transition={{ duration: 0.15 }}
      onDragOver={e => e.preventDefault()}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
    </motion.div>
  )
}
