/**
 * Bulk Operations Panel Components
 * Extracted components for bulk operations panel
 */
'use client'

import { ArrowRight, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PipelineStage } from '@/services/crm-leads'

import { STAGE_OPTIONS } from './bulk-operations-panel-types'

// Stage move section component
export function StageMoveSectionComponent({
  onBulkStageMove,
  selectedStage,
  setSelectedStage,
  handleStageMove,
  isLoading,
}: {
  onBulkStageMove?: (leadIds: string[], stage: PipelineStage) => Promise<void>
  selectedStage: PipelineStage | ''
  setSelectedStage: (stage: PipelineStage | '') => void
  handleStageMove: () => Promise<void>
  isLoading: boolean
}): React.ReactElement | null {
  if (!onBulkStageMove) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedStage}
        onValueChange={value => setSelectedStage(value as PipelineStage)}
        disabled={isLoading}
      >
        <SelectTrigger className="w-36 h-8">
          <SelectValue placeholder="Move to..." />
        </SelectTrigger>
        <SelectContent>
          {STAGE_OPTIONS.map(stage => (
            <SelectItem key={stage.value} value={stage.value}>
              {stage.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        onClick={() => {
          void handleStageMove()
        }}
        disabled={selectedStage === '' || isLoading}
        className="h-8"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

// User assign section component
export function UserAssignSectionComponent({
  onBulkAssign,
  availableUsers,
  selectedUser,
  setSelectedUser,
  handleBulkAssign,
  isLoading,
}: {
  onBulkAssign?: (leadIds: string[], userId: string) => Promise<void>
  availableUsers: Array<{ id: string; name: string }>
  selectedUser: string
  setSelectedUser: (user: string) => void
  handleBulkAssign: () => Promise<void>
  isLoading: boolean
}): React.ReactElement | null {
  if (!onBulkAssign || availableUsers.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedUser} onValueChange={setSelectedUser} disabled={isLoading}>
        <SelectTrigger className="w-36 h-8">
          <SelectValue placeholder="Assign to..." />
        </SelectTrigger>
        <SelectContent>
          {availableUsers.map(user => (
            <SelectItem key={user.id} value={user.id}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        onClick={() => {
          void handleBulkAssign()
        }}
        disabled={!selectedUser || isLoading}
        className="h-8"
      >
        <Users className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Re-export QuickActionsComponent for backward compatibility
export { QuickActionsComponent } from './bulk-operations-quick-actions'
