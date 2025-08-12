/**
 * Bulk Operations Panel Setup Logic
 * Extracted to reduce main function size
 */
import { useState } from 'react'

import { PipelineStage } from '@/services/crm-leads'

import {
  createBulkOperationHandlers,
  type BulkOperationHandlers,
} from './bulk-operations-panel-handlers'

import type { BulkOperationsPanelProps } from './bulk-operations-panel-types'

export function useBulkOperationsSetup({
  selectedLeadIds,
  onBulkDelete,
  onBulkStageMove,
  onBulkAssign,
  onBulkTag,
  onBulkArchive,
  onClearSelection,
  availableUsers,
}: Pick<
  BulkOperationsPanelProps,
  | 'selectedLeadIds'
  | 'onBulkDelete'
  | 'onBulkStageMove'
  | 'onBulkAssign'
  | 'onBulkTag'
  | 'onBulkArchive'
  | 'onClearSelection'
  | 'availableUsers'
>): {
  showDeleteConfirm: boolean
  setShowDeleteConfirm: (show: boolean) => void
  selectedStage: PipelineStage | ''
  selectedUser: string
  selectedTags: string[]
  availableUsers: Array<{ id: string; name: string }>
  handlers: BulkOperationHandlers
} {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedStage, setSelectedStage] = useState<PipelineStage | ''>('')
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handlers = createBulkOperationHandlers({
    selectedLeadIds,
    selectedStage,
    selectedUser,
    selectedTags,
    onBulkDelete,
    onBulkStageMove,
    onBulkAssign,
    onBulkTag,
    onBulkArchive,
    onClearSelection,
    setSelectedStage,
    setSelectedUser,
    setSelectedTags,
    setShowDeleteConfirm,
  })

  return {
    showDeleteConfirm,
    setShowDeleteConfirm,
    selectedStage,
    selectedUser,
    selectedTags,
    availableUsers: availableUsers ?? [],
    handlers,
  }
}
