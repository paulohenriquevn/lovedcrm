/**
 * Bulk Operations Panel Handlers
 * Business logic handlers for bulk operations
 */
import { PipelineStage } from '@/services/crm-leads'

export interface BulkOperationHandlers {
  handleBulkDelete: () => Promise<void>
  handleStageMove: () => Promise<void>
  handleBulkAssign: () => Promise<void>
  handleBulkTag: () => Promise<void>
  handleBulkArchive: () => Promise<void>
  handleStageChange: (stage: PipelineStage | '') => void
  handleUserChange: (user: string) => void
  setShowDeleteConfirm: (show: boolean) => void
}

export function createBulkOperationHandlers({
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
}: {
  selectedLeadIds: string[]
  selectedStage: PipelineStage | ''
  selectedUser: string
  selectedTags: string[]
  onBulkDelete?: (leadIds: string[]) => Promise<void>
  onBulkStageMove?: (leadIds: string[], stage: PipelineStage) => Promise<void>
  onBulkAssign?: (leadIds: string[], userId: string) => Promise<void>
  onBulkTag?: (leadIds: string[], tags: string[]) => Promise<void>
  onBulkArchive?: (leadIds: string[]) => Promise<void>
  onClearSelection: () => void
  setSelectedStage: (stage: PipelineStage | '') => void
  setSelectedUser: (user: string) => void
  setSelectedTags: (tags: string[]) => void
  setShowDeleteConfirm: (show: boolean) => void
}): BulkOperationHandlers {
  // Handle bulk delete confirmation
  const handleBulkDelete = async (): Promise<void> => {
    if (onBulkDelete) {
      await onBulkDelete(selectedLeadIds)
      onClearSelection()
    }
    setShowDeleteConfirm(false)
  }

  // Handle bulk stage move
  const handleStageMove = async (): Promise<void> => {
    if (Boolean(selectedStage) && onBulkStageMove) {
      await onBulkStageMove(selectedLeadIds, selectedStage as PipelineStage)
      onClearSelection()
      setSelectedStage('')
    }
  }

  // Handle bulk assign
  const handleBulkAssign = async (): Promise<void> => {
    if (Boolean(selectedUser) && onBulkAssign) {
      await onBulkAssign(selectedLeadIds, selectedUser)
      onClearSelection()
      setSelectedUser('')
    }
  }

  // Handle bulk tag
  const handleBulkTag = async (): Promise<void> => {
    if (selectedTags.length > 0 && onBulkTag) {
      await onBulkTag(selectedLeadIds, selectedTags)
      onClearSelection()
      setSelectedTags([])
    }
  }

  // Handle bulk archive
  const handleBulkArchive = async (): Promise<void> => {
    if (onBulkArchive) {
      await onBulkArchive(selectedLeadIds)
      onClearSelection()
    }
  }

  return {
    handleBulkDelete,
    handleStageMove,
    handleBulkAssign,
    handleBulkTag,
    handleBulkArchive,
    handleStageChange: setSelectedStage,
    handleUserChange: setSelectedUser,
    setShowDeleteConfirm,
  }
}
