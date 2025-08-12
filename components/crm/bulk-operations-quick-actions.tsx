/**
 * Bulk Operations Quick Actions
 * Quick action components for bulk operations
 */
'use client'

import { Archive, Edit3, MoreHorizontal, Tag, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// Tag action button
function TagButton({
  onBulkTag,
  handleBulkTag,
  isLoading,
}: {
  onBulkTag?: (leadIds: string[], tags: string[]) => Promise<void>
  handleBulkTag: () => Promise<void>
  isLoading: boolean
}): React.ReactElement | null {
  if (!onBulkTag) {
    return null
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        void handleBulkTag()
      }}
      disabled={isLoading}
      className="h-8 px-2"
    >
      <Tag className="h-4 w-4" />
      <span className="sr-only">Add tags</span>
    </Button>
  )
}

// Archive action button
function ArchiveButton({
  onBulkArchive,
  handleBulkArchive,
  isLoading,
}: {
  onBulkArchive?: (leadIds: string[]) => Promise<void>
  handleBulkArchive: () => Promise<void>
  isLoading: boolean
}): React.ReactElement | null {
  if (!onBulkArchive) {
    return null
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        void handleBulkArchive()
      }}
      disabled={isLoading}
      className="h-8 px-2"
    >
      <Archive className="h-4 w-4" />
      <span className="sr-only">Archive leads</span>
    </Button>
  )
}

// Custom actions dropdown
function CustomActionsDropdown({
  customActions,
  selectedLeadIds,
  isLoading,
}: {
  customActions: Array<{
    key: string
    label: string
    icon: typeof Edit3
    onClick: (leadIds: string[]) => void
    variant?: 'default' | 'destructive' | 'outline'
  }>
  selectedLeadIds: string[]
  isLoading: boolean
}): React.ReactElement | null {
  if (customActions.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" disabled={isLoading} className="h-8 px-2">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {customActions.map(action => (
          <DropdownMenuItem
            key={action.key}
            onClick={() => action.onClick(selectedLeadIds)}
            className={cn(action.variant === 'destructive' && 'text-red-600')}
          >
            <action.icon className="h-4 w-4 mr-2" />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Delete action button
function DeleteButton({
  onBulkDelete,
  setShowDeleteConfirm,
  isLoading,
}: {
  onBulkDelete?: (leadIds: string[]) => Promise<void>
  setShowDeleteConfirm: (show: boolean) => void
  isLoading: boolean
}): React.ReactElement | null {
  if (!onBulkDelete) {
    return null
  }

  return (
    <Button
      size="sm"
      variant="destructive"
      onClick={() => setShowDeleteConfirm(true)}
      disabled={isLoading}
      className="h-8 px-2"
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Delete leads</span>
    </Button>
  )
}

export function QuickActionsComponent({
  onBulkTag,
  onBulkArchive,
  onBulkDelete,
  customActions,
  selectedLeadIds,
  isLoading,
  handleBulkTag,
  handleBulkArchive,
  setShowDeleteConfirm,
}: {
  onBulkTag?: (leadIds: string[], tags: string[]) => Promise<void>
  onBulkArchive?: (leadIds: string[]) => Promise<void>
  onBulkDelete?: (leadIds: string[]) => Promise<void>
  customActions: Array<{
    key: string
    label: string
    icon: typeof Edit3
    onClick: (leadIds: string[]) => void
    variant?: 'default' | 'destructive' | 'outline'
  }>
  selectedLeadIds: string[]
  isLoading: boolean
  handleBulkTag: () => Promise<void>
  handleBulkArchive: () => Promise<void>
  setShowDeleteConfirm: (show: boolean) => void
}): React.ReactElement {
  return (
    <div className="flex gap-1">
      <TagButton onBulkTag={onBulkTag} handleBulkTag={handleBulkTag} isLoading={isLoading} />
      <ArchiveButton
        onBulkArchive={onBulkArchive}
        handleBulkArchive={handleBulkArchive}
        isLoading={isLoading}
      />
      <CustomActionsDropdown
        customActions={customActions}
        selectedLeadIds={selectedLeadIds}
        isLoading={isLoading}
      />
      <DeleteButton
        onBulkDelete={onBulkDelete}
        setShowDeleteConfirm={setShowDeleteConfirm}
        isLoading={isLoading}
      />
    </div>
  )
}
