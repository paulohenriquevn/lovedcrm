/**
 * Bulk Operations Panel Types
 * Type definitions and interfaces for bulk operations
 */
import { Edit3 } from 'lucide-react'

import { PipelineStage } from '@/services/crm-leads'

export interface BulkOperationsPanelProps {
  /** Number of selected leads */
  selectedCount: number
  /** Selected lead IDs */
  selectedLeadIds: string[]
  /** Whether the panel is visible */
  isVisible: boolean
  /** Callback to clear selection */
  onClearSelection: () => void
  /** Callback for bulk delete */
  onBulkDelete?: (leadIds: string[]) => Promise<void>
  /** Callback for bulk stage move */
  onBulkStageMove?: (leadIds: string[], stage: PipelineStage) => Promise<void>
  /** Callback for bulk assign */
  onBulkAssign?: (leadIds: string[], userId: string) => Promise<void>
  /** Callback for bulk tag */
  onBulkTag?: (leadIds: string[], tags: string[]) => Promise<void>
  /** Callback for bulk archive */
  onBulkArchive?: (leadIds: string[]) => Promise<void>
  /** Available users for assignment */
  availableUsers?: Array<{ id: string; name: string }>
  /** Available tags */
  availableTags?: string[]
  /** Custom actions */
  customActions?: Array<{
    key: string
    label: string
    icon: typeof Edit3
    onClick: (leadIds: string[]) => void
    variant?: 'default' | 'destructive' | 'outline'
  }>
  /** Loading state */
  isLoading?: boolean
  /** Panel position */
  position?: 'bottom' | 'top'
  /** Additional CSS classes */
  className?: string
}

// Stage options for bulk move
export const STAGE_OPTIONS: Array<{ value: PipelineStage; label: string }> = [
  { value: PipelineStage.LEAD, label: 'Lead' },
  { value: PipelineStage.CONTATO, label: 'Contato' },
  { value: PipelineStage.PROPOSTA, label: 'Proposta' },
  { value: PipelineStage.NEGOCIACAO, label: 'Negociação' },
  { value: PipelineStage.FECHADO, label: 'Fechado' },
]
