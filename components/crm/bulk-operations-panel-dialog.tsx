/**
 * Bulk Operations Panel Delete Confirmation Dialog
 * Extracted to reduce function size
 */
'use client'

import { Trash2 } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface BulkOperationsPanelDialogProps {
  showDeleteConfirm: boolean
  setShowDeleteConfirm: (show: boolean) => void
  selectedCount: number
  onBulkDelete: () => Promise<void>
}

export function BulkOperationsPanelDialog({
  showDeleteConfirm,
  setShowDeleteConfirm,
  selectedCount,
  onBulkDelete,
}: BulkOperationsPanelDialogProps): React.ReactElement {
  return (
    <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Delete Selected Leads
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {selectedCount} lead{selectedCount === 1 ? '' : 's'}?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              void onBulkDelete()
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete {selectedCount} Lead{selectedCount === 1 ? '' : 's'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
