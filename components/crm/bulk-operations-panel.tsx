/**
 * Bulk Operations Panel
 * Fixed bottom panel for bulk lead operations with smooth animations
 * Features: Counter, stage move, assign, tag, delete with confirmation
 * Story 3.3: Lead Management - Melhorias UX
 */
'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PipelineStage } from '@/services/crm-leads'

import { BulkOperationsPanelDialog } from './bulk-operations-panel-dialog'
import { BulkOperationsPanelMain } from './bulk-operations-panel-main'
import { useBulkOperationsSetup } from './bulk-operations-panel-setup'

import type { BulkOperationsPanelProps } from './bulk-operations-panel-types'

export { type BulkOperationsPanelProps } from './bulk-operations-panel-types'

// Helper to create handlers object for main panel
function createHandlersForMainPanel(config: {
  selectedStage: PipelineStage | ''
  selectedUser: string
  setupAvailableUsers: Array<{ id: string; name: string }>
  onBulkStageMove?: (leadIds: string[], stage: PipelineStage) => Promise<void>
  onBulkAssign?: (leadIds: string[], userId: string) => Promise<void>
  onBulkTag?: (leadIds: string[], tags: string[]) => Promise<void>
  handlers: {
    handleStageMove: () => Promise<void>
    handleBulkAssign: () => Promise<void>
    handleBulkDelete: () => Promise<void>
    handleBulkArchive: () => Promise<void>
    handleBulkTag: () => Promise<void>
    handleStageChange: (stage: PipelineStage | '') => void
    handleUserChange: (user: string) => void
    setShowDeleteConfirm: (show: boolean) => void
  }
}): {
  selectedStage: PipelineStage | ''
  selectedUser: string
  availableUsers: Array<{ id: string; name: string }>
  handleStageChange: (stage: PipelineStage | '') => void
  handleMoveToStage: () => Promise<void>
  handleUserChange: (user: string) => void
  handleAssignUser: () => Promise<void>
  handleBulkDelete: () => Promise<void>
  handleBulkArchive: () => Promise<void>
  onBulkStageMove?: (leadIds: string[], stage: PipelineStage) => Promise<void>
  onBulkAssign?: (leadIds: string[], userId: string) => Promise<void>
  onBulkTag?: (leadIds: string[], tags: string[]) => Promise<void>
  handleBulkTag: () => Promise<void>
  setShowDeleteConfirm: (show: boolean) => void
} {
  return {
    selectedStage: config.selectedStage,
    selectedUser: config.selectedUser,
    availableUsers: config.setupAvailableUsers,
    handleStageChange: config.handlers.handleStageChange,
    handleMoveToStage: config.handlers.handleStageMove,
    handleUserChange: config.handlers.handleUserChange,
    handleAssignUser: config.handlers.handleBulkAssign,
    handleBulkDelete: config.handlers.handleBulkDelete,
    handleBulkArchive: config.handlers.handleBulkArchive,
    onBulkStageMove: config.onBulkStageMove,
    onBulkAssign: config.onBulkAssign,
    onBulkTag: config.onBulkTag,
    handleBulkTag: config.handlers.handleBulkTag,
    setShowDeleteConfirm: config.handlers.setShowDeleteConfirm,
  }
}

export function BulkOperationsPanel({
  selectedCount,
  selectedLeadIds,
  isVisible,
  onClearSelection,
  onBulkDelete,
  onBulkStageMove,
  onBulkAssign,
  onBulkTag,
  onBulkArchive,
  availableUsers = [],
  customActions = [],
  isLoading = false,
  position = 'bottom',
  className,
}: BulkOperationsPanelProps): React.ReactElement | null {
  const {
    showDeleteConfirm,
    setShowDeleteConfirm,
    selectedStage,
    selectedUser,
    availableUsers: setupAvailableUsers,
    handlers,
  } = useBulkOperationsSetup({
    selectedLeadIds,
    onBulkDelete,
    onBulkStageMove,
    onBulkAssign,
    onBulkTag,
    onBulkArchive,
    onClearSelection,
    availableUsers,
  })

  // Don't render if not visible or no selection
  if (!isVisible || selectedCount === 0) {
    return null
  }

  const positionClasses =
    position === 'bottom'
      ? 'bottom-4 animate-in slide-in-from-bottom-full'
      : 'top-4 animate-in slide-in-from-top-full'

  return (
    <>
      {/* Fixed positioned panel */}
      <div
        className={cn(
          'fixed left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4',
          positionClasses,
          className
        )}
      >
        <BulkOperationsPanelMain
          selectedCount={selectedCount}
          selectedLeadIds={selectedLeadIds}
          onClearSelection={onClearSelection}
          isLoading={isLoading}
          handlers={createHandlersForMainPanel({
            selectedStage,
            selectedUser,
            setupAvailableUsers,
            onBulkStageMove,
            onBulkAssign,
            onBulkTag,
            handlers,
          })}
          customActions={customActions}
        />
      </div>

      {/* Delete confirmation dialog */}
      <BulkOperationsPanelDialog
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        selectedCount={selectedCount}
        onBulkDelete={async () => {
          await handlers.handleBulkDelete()
        }}
      />
    </>
  )
}

// Keyboard shortcuts help component
export function BulkOperationsKeyboardHelp(): React.ReactElement {
  const shortcuts = [
    { key: 'Ctrl+A', description: 'Select all visible leads' },
    { key: 'Escape', description: 'Clear selection' },
    { key: 'Delete', description: 'Delete selected leads' },
    { key: 'Ctrl+M', description: 'Move selected leads to stage' },
    { key: 'Ctrl+E', description: 'Edit selected leads' },
    { key: 'Space', description: 'Toggle lead selection' },
    { key: 'Enter', description: 'Open lead details' },
  ]

  return (
    <Card className="p-4">
      <h3 className="font-medium mb-3">Keyboard Shortcuts</h3>
      <div className="space-y-2">
        {shortcuts.map(shortcut => (
          <div key={shortcut.key} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{shortcut.description}</span>
            <Badge variant="outline" className="text-xs">
              {shortcut.key}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}

// Named export only - no default export
