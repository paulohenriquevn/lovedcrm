/**
 * Pipeline Kanban Helper Components
 * Extracted helper components to reduce file complexity
 * Enhanced with UX improvements and drop zone animations
 */
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { Lead } from '@/services/crm-leads'

import { LeadCard } from './lead-card-components'
import { useDragHandlers } from './pipeline-kanban-drag-handlers'
import {
  AddLeadCard,
  StageDropZone,
  StageHeader,
  StageLeadsList,
} from './pipeline-kanban-stage-components'
import { PipelineStageDisplay } from './pipeline-types'
import { useUXEnhancements } from './pipeline-ux-enhancements'

// Loading and Error states moved to separate file
export { LoadingState, ErrorState } from './pipeline-loading-components'

// Re-export the stage components for backward compatibility
export {
  AddLeadCard,
  StageDropZone,
  StageHeader,
  StageLeadsList,
} from './pipeline-kanban-stage-components'

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
  selectedLeadIds = [],
  onToggleSelection,
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
  selectedLeadIds?: string[]
  onToggleSelection?: (leadId: string) => void
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
          selectedLeadIds={selectedLeadIds}
          onToggleSelection={onToggleSelection}
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
          initial={reducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
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
