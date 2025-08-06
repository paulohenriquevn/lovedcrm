import { Upload, User, Globe } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User as UserType } from '@/types/user'

import { InputField, SelectField } from './FormFields'

// Helper function to get user initial
function getUserInitial(user: UserType): string {
  const fullName = user.full_name ?? ''

  if (fullName.length > 0) {
    return fullName.charAt(0).toUpperCase()
  }
  if (user.email && user.email.length > 0) {
    return user.email.charAt(0).toUpperCase()
  }
  return 'U'
}

// Helper functions to reduce complexity
function getFieldValue(isEditing: boolean, formValue?: string, userValue?: string): string {
  return isEditing ? (formValue ?? '') : (userValue ?? '')
}

function getFieldProps(
  isEditing: boolean,
  onChange: (value: string) => void
): Record<string, unknown> {
  return isEditing ? { onChange } : {}
}

// Personal info form fields component
function PersonalInfoFields({
  user,
  formData,
  onInputChange,
  isEditing,
}: {
  user: UserType
  formData: { full_name?: string; phone?: string }
  onInputChange: (field: string, value: string) => void
  isEditing: boolean
}): JSX.Element {
  return (
    <div className="space-y-4">
      <InputField
        label="Nome completo"
        value={getFieldValue(isEditing, formData.full_name, user.full_name)}
        {...getFieldProps(isEditing, value => onInputChange('full_name', value))}
        disabled={!isEditing}
      />

      <InputField
        label="Email"
        type="email"
        value={user.email}
        disabled
        note="O email não pode ser alterado após o cadastro"
      />

      <InputField
        label="Telefone"
        type="tel"
        value={getFieldValue(isEditing, formData.phone, user.phone)}
        {...getFieldProps(isEditing, value => onInputChange('phone', value))}
        disabled={!isEditing}
      />
    </div>
  )
}

// Avatar section component (using Next.js Image)
export function ProfileAvatar({ user }: { user: UserType }): JSX.Element {
  return (
    <div className="flex items-center mb-6">
      {user.avatar_url !== null && user.avatar_url !== undefined && user.avatar_url !== '' ? (
        <Image
          className="h-20 w-20 rounded-full"
          src={user.avatar_url}
          alt="Profile avatar"
          width={80}
          height={80}
        />
      ) : (
        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-600 text-2xl font-medium">{getUserInitial(user)}</span>
        </div>
      )}
      <Button type="button" variant="outline" className="ml-4">
        <Upload className="h-4 w-4 mr-2" />
        Alterar foto
      </Button>
    </div>
  )
}

// Re-export form fields from separate file
export { InputField, SelectField } from './FormFields'

// Re-export ProfileHeader from separate file
export { ProfileHeader } from './ProfileHeader'

// Personal info section
export function PersonalInfoSection({
  user,
  formData,
  onInputChange,
  isEditing,
}: {
  user: UserType
  formData: { full_name?: string; phone?: string }
  onInputChange: (field: string, value: string) => void
  isEditing: boolean
}): JSX.Element {
  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <User className="h-4 w-4 mr-2" />
          Informações pessoais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ProfileAvatar user={user} />

        <PersonalInfoFields
          user={user}
          formData={formData}
          onInputChange={onInputChange}
          isEditing={isEditing}
        />
      </CardContent>
    </Card>
  )
}

// Re-export AccountInfoSection from separate file
export { AccountInfoSection } from './AccountInfoSection'

// Preferences section
export function PreferencesSection({
  formData,
  onInputChange,
  isEditing,
  timezoneOptions,
  languageOptions,
}: {
  formData: { timezone?: string; language?: string }
  onInputChange: (field: string, value: string) => void
  isEditing: boolean
  timezoneOptions: { value: string; label: string }[]
  languageOptions: { value: string; label: string }[]
}): JSX.Element {
  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <Globe className="h-4 w-4 mr-2" />
          Preferências
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <SelectField
            label="Fuso horário"
            value={formData.timezone ?? 'America/Sao_Paulo'}
            {...(isEditing ? { onChange: value => onInputChange('timezone', value) } : {})}
            options={timezoneOptions}
            disabled={!isEditing}
          />

          <SelectField
            label="Idioma"
            value={formData.language ?? 'pt-BR'}
            {...(isEditing ? { onChange: value => onInputChange('language', value) } : {})}
            options={languageOptions}
            disabled={!isEditing}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Re-export FormActions from separate file
export { FormActions } from './ProfileFormActions'
