'use client'

import { AlertTriangle } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'

interface DeleteConfirmationDialogProps {
  confirmText: string
  onConfirmTextChange: (text: string) => void
  onConfirm: () => void
  onCancel: () => void
  isEnabled: boolean
}

export function DeleteConfirmationDialog({
  confirmText,
  onConfirmTextChange,
  onConfirm,
  onCancel,
  isEnabled,
}: DeleteConfirmationDialogProps): JSX.Element {
  const handleInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      onConfirmTextChange(event.target.value)
    },
    [onConfirmTextChange]
  )

  return (
    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
      <div className="space-y-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
          <div className="text-sm text-red-800">
            <p className="font-medium mb-2">Esta ação é irreversível!</p>
            <ul className="space-y-1 text-xs">
              <li>• Todos os seus dados serão excluídos permanentemente</li>
              <li>• Você perderá acesso a todas as organizações</li>
              <li>• Assinaturas ativas serão canceladas</li>
              <li>• Esta ação não pode ser desfeita</li>
            </ul>
          </div>
        </div>

        <div>
          <label
            htmlFor="delete-confirm-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Digite &quot;DELETAR MINHA CONTA&quot; para confirmar:
          </label>
          <input
            id="delete-confirm-input"
            type="text"
            value={confirmText}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Digite exatamente: DELETAR MINHA CONTA"
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={onConfirm} disabled={!isEnabled} variant="destructive" size="sm">
            Confirmar Exclusão
          </Button>
          <Button onClick={onCancel} variant="outline" size="sm">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
