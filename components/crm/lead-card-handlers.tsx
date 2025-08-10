/**
 * Lead Card Handlers
 * Extracted handlers and wrapper components for lead cards
 */

import { motion } from 'framer-motion'
import { useCallback } from 'react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Lead } from '@/services/crm-leads'

import { useUXEnhancements } from './pipeline-ux-enhancements'

export function useLeadCardHandlers(
  lead: Lead,
  onDragStart: (lead: Lead) => void,
  onViewDetails: (lead: Lead) => void
): {
  handleDragStart: (e: React.DragEvent) => void
  handleCardClick: () => void
} {
  const { triggerHaptic } = useUXEnhancements()

  const handleDragStart = useCallback(
    (_e: React.DragEvent) => {
      triggerHaptic([50]) // Brief haptic feedback on drag start
      onDragStart(lead)
    },
    [lead, onDragStart, triggerHaptic]
  )

  const handleCardClick = useCallback(() => {
    triggerHaptic([25]) // Subtle haptic for card tap
    onViewDetails(lead)
  }, [lead, onViewDetails, triggerHaptic])

  return { handleDragStart, handleCardClick }
}

export function LeadCardWrapper({
  children,
  reducedMotion,
  hoverClasses,
  isDragging,
  onDragStart,
  onClick,
}: {
  children: React.ReactNode
  reducedMotion: boolean
  hoverClasses: string
  isDragging: boolean
  onDragStart: (e: React.DragEvent) => void
  onClick: () => void
}): React.ReactElement {
  return (
    <motion.div
      layout={!reducedMotion}
      initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? undefined : { opacity: 0, y: -20 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="w-full"
    >
      <Card
        className={cn(
          'cursor-grab w-full transition-all duration-150',
          hoverClasses,
          isDragging && 'opacity-50 rotate-1 cursor-grabbing',
          !reducedMotion && 'active:scale-[0.98]', // Press feedback
          'hover:shadow-lg' // Enhanced shadow on hover
        )}
        draggable
        onDragStart={onDragStart}
        onClick={onClick}
      >
        {children}
      </Card>
    </motion.div>
  )
}
