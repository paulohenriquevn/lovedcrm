/**
 * Pipeline Kanban Helper Components
 * Extracted helper components to reduce file complexity
 * Enhanced with UX improvements and drop zone animations
 */
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Lead } from '@/services/crm-leads'

import { LeadCard } from './lead-card-components'
import { PipelineStageDisplay } from './pipeline-types'
import { useUXEnhancements } from './pipeline-ux-enhancements'

const handleDragOver = (e: React.DragEvent): void => {
  e.preventDefault()
}

// Loading and Error states moved to separate file
export { LoadingState, ErrorState } from './pipeline-loading-components'

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

function useDragHandlers(
  setIsDropZoneActive: React.Dispatch<React.SetStateAction<boolean>>,
  onDrop: (stageId: string) => void,
  stageId: string
): {
  handleDragEnter: (e: React.DragEvent) => void
  handleDragLeave: (e: React.DragEvent) => void
  handleDropEnhanced: (e: React.DragEvent) => void
} {
  const handleDragEnter = (e: React.DragEvent): void => {
    e.preventDefault()
    setIsDropZoneActive(true)
  }

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault()
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return
    }
    setIsDropZoneActive(false)
  }

  const handleDropEnhanced = (e: React.DragEvent): void => {
    e.preventDefault()
    setIsDropZoneActive(false)
    onDrop(stageId)
  }

  return { handleDragEnter, handleDragLeave, handleDropEnhanced }
}

function StageLeadsList({
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
          />
        </motion.div>
      ))}
    </>
  )
}

function StageDropZone({
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
      onDragOver={handleDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
    </motion.div>
  )
}

export function StageColumn({
  stage,
  onDragStart,
  onDrop,
  onAddLead,
  onViewDetails,
  onEditLead,
  onSendEmail,
  onRemoveLead,
  onCall,
  onWhatsApp,
  draggedLead = null,
}: {
  stage: PipelineStageDisplay
  onDragStart: (lead: Lead) => void
  onDrop: (stageId: string) => void
  onAddLead: (stageId?: string) => void
  onViewDetails: (lead: Lead) => void
  onEditLead: (lead: Lead) => void
  onSendEmail: (lead: Lead) => void
  onRemoveLead: (lead: Lead) => void
  onCall: (lead: Lead) => void
  onWhatsApp: (lead: Lead) => void
  draggedLead?: Lead | null
}): React.ReactElement {
  const [isDropZoneActive, setIsDropZoneActive] = useState(false)
  const { detectReducedMotion } = useUXEnhancements()
  const reducedMotion = detectReducedMotion()
  const { handleDragEnter, handleDragLeave, handleDropEnhanced } = useDragHandlers(
    setIsDropZoneActive,
    onDrop,
    stage.id
  )

  return (
    <StageDropZone
      isDropZoneActive={isDropZoneActive}
      reducedMotion={reducedMotion}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDropEnhanced}
    >
      <StageHeader stage={stage} onAddLead={() => onAddLead(stage.id)} />
      <motion.div
        className="space-y-3 min-h-[600px] p-2 rounded-lg border-2 border-transparent"
        animate={
          !isDropZoneActive || reducedMotion
            ? {}
            : {
                borderStyle: 'dashed',
                borderColor: 'hsl(var(--sector-primary) / 0.3)',
              }
        }
        transition={{ duration: 0.15 }}
      >
        <StageLeadsList
          leads={stage.leads}
          onDragStart={onDragStart}
          onViewDetails={onViewDetails}
          onEditLead={onEditLead}
          onSendEmail={onSendEmail}
          onRemoveLead={onRemoveLead}
          onCall={onCall}
          onWhatsApp={onWhatsApp}
          draggedLead={draggedLead}
          reducedMotion={reducedMotion}
        />
        <AddLeadCard onAddLead={() => onAddLead(stage.id)} />
      </motion.div>
    </StageDropZone>
  )
}

// Ghost overlay component for drag operations
export function PipelineGhostOverlay({
  draggedLead,
  isDragging,
}: {
  draggedLead: Lead | null
  isDragging: boolean
}): React.ReactElement {
  const { detectReducedMotion } = useUXEnhancements()
  const reducedMotion = detectReducedMotion()

  return (
    <AnimatePresence>
      {isDragging && draggedLead ? (
        <motion.div
          key="ghost-overlay"
          initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 pointer-events-none z-50"
          style={{ pointerEvents: 'none' }}
        >
          <div
            className={cn(
              'drag-ghost absolute top-4 left-4 w-64',
              reducedMotion ? '' : 'rotate-2 shadow-2xl'
            )}
          >
            <LeadCard
              lead={draggedLead}
              onDragStart={() => {}}
              onViewDetails={() => {}}
              onEditLead={() => {}}
              onSendEmail={() => {}}
              onRemoveLead={() => {}}
              onCall={() => {}}
              onWhatsApp={() => {}}
              isDragging
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
