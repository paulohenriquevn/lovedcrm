import { Edit2, Save, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import type { Organization, OrganizationRole } from '@/types/organization'

// Organization name validation function
function validateOrganizationName(name: string): string | null {
  const trimmedName = name.trim()
  if (!trimmedName) {
    return 'Nome da organização é obrigatório'
  }
  if (trimmedName.length < 2) {
    return 'Nome deve ter pelo menos 2 caracteres'
  }
  if (trimmedName.length > 100) {
    return 'Nome deve ter no máximo 100 caracteres'
  }
  return null
}

interface OrganizationHeaderEditingProps {
  organization: Organization
  onSave: (data: Partial<Organization>) => void
  onCancel: () => void
  isUpdating: boolean
}

function OrganizationHeaderEditing({
  organization,
  onSave,
  onCancel,
  isUpdating,
}: OrganizationHeaderEditingProps): JSX.Element {
  const [name, setName] = useState(organization.name)
  const [description, setDescription] = useState(organization.description ?? '')
  const [nameError, setNameError] = useState<string | null>(null)

  const handleSave = (): void => {
    const error = validateOrganizationName(name)
    setNameError(error)

    if (error === null) {
      onSave({
        name: name.trim(),
        description: description.trim() || undefined,
      })
    }
  }

  const handleNameChange = (value: string): void => {
    setName(value)
    if (nameError !== null) {
      setNameError(null)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Input
          placeholder="Nome da organização"
          value={name}
          onChange={e => handleNameChange(e.target.value)}
          className={nameError === null ? '' : 'border-red-500 focus:ring-red-500'}
          disabled={isUpdating}
        />
        {nameError === null ? null : <p className="text-sm text-red-600 mt-1">{nameError}</p>}
      </div>
      <div>
        <Input
          placeholder="Descrição (opcional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          disabled={isUpdating}
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" onClick={handleSave} disabled={isUpdating} size="sm">
          <Save className="h-4 w-4" />
          {isUpdating ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button type="button" onClick={onCancel} variant="outline" disabled={isUpdating} size="sm">
          <X className="h-4 w-4" />
          Cancelar
        </Button>
      </div>
    </div>
  )
}

interface OrganizationHeaderDisplayProps {
  organization: Organization
  onEdit: () => void
  canEdit: boolean
}

function OrganizationHeaderDisplay({
  organization,
  onEdit,
  canEdit,
}: OrganizationHeaderDisplayProps): JSX.Element {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h1 className="text-xl font-semibold">{organization.name}</h1>
        {organization.description !== null && organization.description !== undefined && (
          <p className="text-sm text-muted-foreground mt-1">{organization.description}</p>
        )}
      </div>
      {canEdit === true ? (
        <Button type="button" onClick={onEdit} variant="outline" size="sm">
          <Edit2 className="h-4 w-4" />
          Editar
        </Button>
      ) : null}
    </div>
  )
}

interface OrganizationHeaderProps {
  organization: Organization
  userRole: OrganizationRole | string
  isUpdating: boolean
  onUpdateOrganization: (data: Partial<Organization>) => void
}

export function OrganizationHeader({
  organization,
  userRole,
  isUpdating,
  onUpdateOrganization,
}: OrganizationHeaderProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false)
  const canEdit = userRole === 'owner' || userRole === 'admin'

  const handleSave = (data: Partial<Organization>): void => {
    onUpdateOrganization(data)
    setIsEditing(false)
  }

  const handleCancel = (): void => {
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações da Organização</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isEditing ? (
          <OrganizationHeaderEditing
            organization={organization}
            onSave={handleSave}
            onCancel={handleCancel}
            isUpdating={isUpdating}
          />
        ) : (
          <OrganizationHeaderDisplay
            organization={organization}
            onEdit={() => setIsEditing(true)}
            canEdit={canEdit}
          />
        )}
      </CardContent>
    </Card>
  )
}
