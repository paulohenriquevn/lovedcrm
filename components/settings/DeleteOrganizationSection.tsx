'use client'

import { Trash2, AlertTriangle } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Organization } from '@/types/organization'

interface DeleteOrganizationSectionProps {
  organization: Organization
  onDeleteOrganization: () => void
}

export function DeleteOrganizationSection({
  organization,
  onDeleteOrganization,
}: DeleteOrganizationSectionProps): JSX.Element {
  const handleDeleteClick = React.useCallback((): void => {
    // REMOVE: Connect to real organization deletion API when admin features are ready
    // For now, we'll call the handler directly
    onDeleteOrganization()
  }, [onDeleteOrganization])

  return (
    <div className="border border-red-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-gray-900">Excluir Organização</h3>
          <p className="text-sm text-gray-600">
            Remove permanentemente a organização &quot;{organization.name}&quot; e todos os dados
          </p>
        </div>
        <Button onClick={handleDeleteClick} variant="destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir Organização
        </Button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
        <div className="flex items-start">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
          <p className="text-sm text-yellow-800">
            <strong>Atenção:</strong> Apenas o owner da organização pode excluí-la. Esta ação
            afetará todos os membros da equipe.
          </p>
        </div>
      </div>
    </div>
  )
}
