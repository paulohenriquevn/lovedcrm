import { useState } from 'react'

import { Organization, OrganizationUpdate } from '@/types/organization'

// Helper function to safely trim and return undefined for empty strings
function trimOrUndefined(value?: string): string | undefined {
  const trimmed = value?.trim()
  return trimmed !== null && trimmed !== undefined && trimmed !== '' ? trimmed : undefined
}

export function useOrganizationFormState(
  organization: Organization,
  onSubmit: (data: OrganizationUpdate) => void
): {
  isEditing: boolean
  formData: OrganizationUpdate
  handleInputChange: (field: string, value: string) => void
  handleEdit: () => void
  handleCancel: () => void
  handleSave: () => void
} {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<OrganizationUpdate>({
    name: organization.name ?? '',
    description: organization.description ?? '',
    website: organization.website ?? '',
  })

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleEdit = (): void => {
    setIsEditing(true)
    // Reset form data to current organization values
    setFormData({
      name: organization.name ?? '',
      description: organization.description ?? '',
      website: organization.website ?? '',
    })
  }

  const handleCancel = (): void => {
    setIsEditing(false)
    setFormData({
      name: organization.name ?? '',
      description: organization.description ?? '',
      website: organization.website ?? '',
    })
  }

  const handleSave = (): void => {
    const trimmedName = trimOrUndefined(formData.name)
    if (trimmedName === undefined) {
      return
    }

    const updateData: OrganizationUpdate = {
      name: trimmedName,
      description: trimOrUndefined(formData.description),
      website: trimOrUndefined(formData.website),
    }

    onSubmit(updateData)
    setIsEditing(false)
  }

  return {
    isEditing,
    formData,
    handleInputChange,
    handleEdit,
    handleCancel,
    handleSave,
  }
}
