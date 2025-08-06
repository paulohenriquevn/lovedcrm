import { Save, X, Edit2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Organization, OrganizationUpdate } from '@/types/organization'

import {
  OrganizationNameField,
  OrganizationDescriptionField,
  OrganizationWebsiteField,
  OrganizationSlugField,
} from './OrganizationFormFields'
import { useOrganizationFormState } from './useOrganizationFormState'

interface OrganizationSettingsFormProps {
  organization: Organization
  isUpdating: boolean
  onSubmit: (data: OrganizationUpdate) => void
  canEdit: boolean
}

function OrganizationFormHeader({
  canEdit,
  isEditing,
  onEdit,
}: {
  canEdit: boolean
  isEditing: boolean
  onEdit: () => void
}): JSX.Element {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <div>
        <CardTitle>Configurações da Organização</CardTitle>
        <CardDescription>Gerencie as informações básicas da sua organização.</CardDescription>
      </div>
      {canEdit === true && isEditing === false ? (
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          <Edit2 className="h-4 w-4" />
          Editar
        </Button>
      ) : null}
    </CardHeader>
  )
}

interface OrganizationFormActionsProps {
  isEditing: boolean
  isUpdating: boolean
  onSave: () => void
  onCancel: () => void
}

function OrganizationFormActions({
  isEditing,
  isUpdating,
  onSave,
  onCancel,
}: OrganizationFormActionsProps): JSX.Element | null {
  if (!isEditing) {
    return null
  }

  return (
    <div className="flex justify-end space-x-2 pt-4 border-t">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isUpdating} size="sm">
        <X className="h-4 w-4" />
        Cancelar
      </Button>
      <Button type="button" onClick={onSave} disabled={isUpdating} size="sm">
        <Save className="h-4 w-4" />
        {isUpdating ? 'Salvando...' : 'Salvar'}
      </Button>
    </div>
  )
}

export function OrganizationSettingsForm({
  organization,
  isUpdating,
  onSubmit,
  canEdit,
}: OrganizationSettingsFormProps): JSX.Element {
  const { isEditing, formData, handleInputChange, handleEdit, handleCancel, handleSave } =
    useOrganizationFormState(organization, onSubmit)

  return (
    <Card>
      <OrganizationFormHeader canEdit={canEdit} isEditing={isEditing} onEdit={handleEdit} />
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <OrganizationNameField
            value={formData.name ?? ''}
            onChange={value => handleInputChange('name', value)}
            disabled={!isEditing || isUpdating}
          />

          <OrganizationDescriptionField
            value={formData.description ?? ''}
            onChange={value => handleInputChange('description', value)}
            disabled={!isEditing || isUpdating}
          />

          <OrganizationWebsiteField
            value={formData.website ?? ''}
            onChange={value => handleInputChange('website', value)}
            disabled={!isEditing || isUpdating}
          />

          <OrganizationSlugField organization={organization} />
        </div>

        <OrganizationFormActions
          isEditing={isEditing}
          isUpdating={isUpdating}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </CardContent>
    </Card>
  )
}
