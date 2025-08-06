import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { User, UserUpdate } from '@/types/user'

import { AccountInfoSection } from './AccountInfoSection'
import { FormActions } from './ProfileFormActions'
import { PersonalInfoSection, PreferencesSection } from './ProfileFormComponents'
import { ProfileHeader } from './ProfileHeader'

interface ProfileFormProps {
  user: User
  isUpdating: boolean
  onSubmit: (data: UserUpdate) => void
  onChangePassword: () => void
}

// Default timezone constant
const DEFAULT_TIMEZONE = 'America/Sao_Paulo'

// Timezone options
const TIMEZONE_OPTIONS = [
  { value: DEFAULT_TIMEZONE, label: 'São Paulo (BRT)' },
  { value: 'America/New_York', label: 'Nova York (EST)' },
  { value: 'Europe/London', label: 'Londres (GMT)' },
  { value: 'Asia/Tokyo', label: 'Tóquio (JST)' },
]

// Language options
const LANGUAGE_OPTIONS = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español' },
]

// Custom hook for profile form state
function useProfileFormState(
  user: User,
  onSubmit: (data: UserUpdate) => void
): {
  isEditing: boolean
  formData: UserUpdate
  handleInputChange: (field: string, value: string) => void
  handleEdit: () => void
  handleCancel: () => void
  handleSave: () => void
} {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<UserUpdate>({
    // eslint-disable-next-line camelcase
    full_name: user.full_name ?? '',
    phone: user.phone ?? '',
    timezone: user.timezone ?? DEFAULT_TIMEZONE,
    language: user.language ?? 'pt-BR',
  })

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleEdit = (): void => {
    setIsEditing(true)
  }

  const handleCancel = (): void => {
    setIsEditing(false)
    setFormData({
      // eslint-disable-next-line camelcase
      full_name: user.full_name ?? '',
      phone: user.phone ?? '',
      timezone: user.timezone ?? DEFAULT_TIMEZONE,
      language: user.language ?? 'pt-BR',
    })
  }

  const handleSave = (): void => {
    onSubmit(formData)
    setIsEditing(false)
  }

  return { isEditing, formData, handleInputChange, handleEdit, handleCancel, handleSave }
}

// Change password section component
function ChangePasswordSection({
  onChangePassword,
  isUpdating,
}: {
  onChangePassword: () => void
  isUpdating: boolean
}): JSX.Element {
  return (
    <div className="flex justify-between pt-4 border-t">
      <Button
        variant="link"
        type="button"
        onClick={onChangePassword}
        disabled={isUpdating}
        className="p-0 h-auto"
      >
        Alterar senha
      </Button>
    </div>
  )
}

export function ProfileForm({
  user,
  isUpdating,
  onSubmit,
  onChangePassword,
}: ProfileFormProps): JSX.Element {
  const { isEditing, formData, handleInputChange, handleEdit, handleCancel, handleSave } =
    useProfileFormState(user, onSubmit)

  return (
    <div className="space-y-6">
      <ProfileHeader />

      <PersonalInfoSection
        user={user}
        formData={formData}
        onInputChange={handleInputChange}
        isEditing={isEditing}
      />

      <AccountInfoSection user={user} />

      <PreferencesSection
        formData={formData}
        onInputChange={handleInputChange}
        isEditing={isEditing}
        timezoneOptions={TIMEZONE_OPTIONS}
        languageOptions={LANGUAGE_OPTIONS}
      />

      <Card>
        <CardContent className="p-6">
          <FormActions
            isEditing={isEditing}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleSave}
            isLoading={isUpdating}
          />

          <ChangePasswordSection onChangePassword={onChangePassword} isUpdating={isUpdating} />
        </CardContent>
      </Card>
    </div>
  )
}
