/**
 * Bulk Operations Panel Main Content
 * Extracted main panel content to reduce function size
 */
import { X, type LucideProps } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PipelineStage } from '@/services/crm-leads'

import {
  QuickActionsComponent,
  StageMoveSectionComponent,
  UserAssignSectionComponent,
} from './bulk-operations-panel-components'

import type { ForwardRefExoticComponent, RefAttributes } from 'react'

interface BulkOperationsHandlers {
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
}

interface BulkOperationsPanelMainProps {
  selectedCount: number
  selectedLeadIds: string[]
  onClearSelection: () => void
  isLoading: boolean
  handlers: BulkOperationsHandlers
  customActions?: Array<{
    key: string
    label: string
    icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
    onClick: (leadIds: string[]) => void
    variant?: 'default' | 'destructive' | 'outline'
  }>
}

export function BulkOperationsPanelMain({
  selectedCount,
  selectedLeadIds,
  onClearSelection,
  isLoading,
  handlers,
  customActions = [],
}: BulkOperationsPanelMainProps): React.ReactElement {
  return (
    <Card className="shadow-lg border-2 bg-white dark:bg-gray-900">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Selection counter */}
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-base px-3 py-1">
              {selectedCount} selected
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
              className="h-8 px-2"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear selection</span>
            </Button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <StageMoveSectionComponent
              onBulkStageMove={handlers.onBulkStageMove}
              selectedStage={handlers.selectedStage}
              setSelectedStage={handlers.handleStageChange}
              handleStageMove={handlers.handleMoveToStage}
              isLoading={isLoading}
            />

            <UserAssignSectionComponent
              onBulkAssign={handlers.onBulkAssign}
              availableUsers={handlers.availableUsers}
              selectedUser={handlers.selectedUser}
              setSelectedUser={handlers.handleUserChange}
              handleBulkAssign={handlers.handleAssignUser}
              isLoading={isLoading}
            />

            <QuickActionsComponent
              onBulkTag={handlers.onBulkTag}
              onBulkArchive={handlers.handleBulkArchive}
              onBulkDelete={handlers.handleBulkDelete}
              customActions={customActions}
              selectedLeadIds={selectedLeadIds}
              isLoading={isLoading}
              handleBulkTag={handlers.handleBulkTag}
              handleBulkArchive={handlers.handleBulkArchive}
              setShowDeleteConfirm={handlers.setShowDeleteConfirm}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
