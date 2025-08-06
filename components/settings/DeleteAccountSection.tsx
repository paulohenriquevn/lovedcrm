'use client'

import { Trash2 } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'

import { DeleteConfirmationDialog } from './DeleteConfirmationDialog'

interface DeleteAccountSectionProps {
  onDeleteAccount: () => void
}

export function DeleteAccountSection({ onDeleteAccount }: DeleteAccountSectionProps): JSX.Element {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<boolean>(false)
  const [deleteConfirmText, setDeleteConfirmText] = React.useState<string>('')

  const handleShowConfirm = React.useCallback((): void => {
    setShowDeleteConfirm(true)
  }, [])

  const handleCancelDelete = React.useCallback((): void => {
    setShowDeleteConfirm(false)
    setDeleteConfirmText('')
  }, [])

  const handleConfirmDelete = React.useCallback((): void => {
    if (deleteConfirmText === 'DELETAR MINHA CONTA') {
      onDeleteAccount()
      setShowDeleteConfirm(false)
      setDeleteConfirmText('')
    }
  }, [deleteConfirmText, onDeleteAccount])

  const handleConfirmTextChange = React.useCallback((text: string): void => {
    setDeleteConfirmText(text)
  }, [])

  const isDeleteEnabled = deleteConfirmText === 'DELETAR MINHA CONTA'

  return (
    <div className="border border-red-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-gray-900">Excluir Conta</h3>
          <p className="text-sm text-gray-600">
            Remove permanentemente sua conta e todos os dados associados
          </p>
        </div>
        <Button onClick={handleShowConfirm} variant="destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir Conta
        </Button>
      </div>

      {showDeleteConfirm === true && (
        <DeleteConfirmationDialog
          confirmText={deleteConfirmText}
          onConfirmTextChange={handleConfirmTextChange}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isEnabled={isDeleteEnabled}
        />
      )}
    </div>
  )
}
