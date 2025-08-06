'use client'

import { ProfileSettingsView } from '@/components/settings/ProfileSettingsView'
import { useToast } from '@/hooks/use-toast'
import { settingsService } from '@/services/settings'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import {
  UserStatus,
  type UserUpdate,
  type User,
  type UserResponse,
  type UserPreferences,
} from '@/types/user'

export function ProfileSettingsContainer() {
  const { user, setUser } = useAuthStore()
  const { isUpdating, setUpdating, setProfile } = useSettingsStore()
  const { toast } = useToast()

  const handleUpdateProfile = async (data: UserUpdate) => {
    await executeProfileUpdate(data, { setUpdating, setProfile, user, setUser, toast })
  }

  const handleUpdatePassword = async (currentPassword: string, newPassword: string) => {
    await executePasswordUpdate(currentPassword, newPassword, { setUpdating, toast })
  }

  return (
    <ProfileSettingsView
      user={transformUserData(user)}
      preferences={getDefaultPreferences()}
      isUpdating={isUpdating}
      onUpdateProfile={data => {
        void handleUpdateProfile(data)
      }}
      onUpdatePreferences={() => handleUpdatePreferences(toast)}
      onChangePassword={() => {
        handlePasswordChange(handleUpdatePassword)
      }}
    />
  )
}

// Helper functions outside component scope
async function executeProfileUpdate(
  data: UserUpdate,
  stores: {
    setUpdating: (updating: boolean) => void
    setProfile: (profile: UserResponse) => void
    user: User | null
    setUser: (user: User | null) => void
    toast: (options: { title?: string; description?: string; variant?: 'destructive' }) => void
  }
) {
  stores.setUpdating(true)

  try {
    const validationError = validateProfileData(data)
    if (validationError !== null) {
      stores.toast({
        title: 'Erro',
        description: validationError,
        variant: 'destructive',
      })
      return
    }

    const updatedProfile = await settingsService.updateProfile(data)
    stores.setProfile(updatedProfile)
    updateUserStores(updatedProfile, stores.user, stores.setUser)
    stores.toast({
      title: 'Sucesso',
      description: 'Perfil atualizado com sucesso!',
    })
  } catch (error) {
    handleUpdateError(error, stores.toast)
  } finally {
    stores.setUpdating(false)
  }
}

async function executePasswordUpdate(
  currentPassword: string,
  newPassword: string,
  context: {
    setUpdating: (updating: boolean) => void
    toast: (options: { title?: string; description?: string; variant?: 'destructive' }) => void
  }
) {
  const { setUpdating, toast } = context
  setUpdating(true)

  try {
    const validationError = validatePasswordData(currentPassword, newPassword)
    if (validationError !== null) {
      toast({
        title: 'Erro',
        description: validationError,
        variant: 'destructive',
      })
      return
    }

    await settingsService.updatePassword(currentPassword, newPassword)
    toast({
      title: 'Sucesso',
      description: 'Senha atualizada com sucesso!',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar senha'
    toast({
      title: 'Erro',
      description: message,
      variant: 'destructive',
    })
  } finally {
    setUpdating(false)
  }
}

function updateUserStores(
  updatedProfile: UserResponse,
  user: User | null,
  setUser: (user: User | null) => void
) {
  if (user !== null) {
    setUser({
      ...user,
      // eslint-disable-next-line camelcase
      full_name: updatedProfile.full_name,
    } as User)
  }
}

function handleUpdateError(
  error: unknown,
  toast: (options: { title?: string; description?: string; variant?: 'destructive' }) => void
) {
  const message = error instanceof Error ? error.message : 'Erro ao atualizar perfil'
  toast({
    title: 'Erro',
    description: message,
    variant: 'destructive',
  })
}

function handleUpdatePreferences(
  toast: (options: { title?: string; description?: string }) => void
): void {
  // TODO: Implement preferences update
  toast({
    title: 'Info',
    description: 'Atualização de preferências não implementada',
  })
}

function handlePasswordChange(
  handleUpdatePassword: (current: string, newPass: string) => Promise<void>
) {
  const currentPassword = prompt('Digite sua senha atual:')
  const newPassword = prompt('Digite sua nova senha:')

  if (
    currentPassword !== null &&
    newPassword !== null &&
    currentPassword.length > 0 &&
    newPassword.length > 0
  ) {
    void handleUpdatePassword(currentPassword, newPassword)
  }
}

function transformUserData(user: unknown) {
  const typedUser = user as {
    id: string
    email: string
    full_name?: string
    is_email_verified?: boolean
    created_at: string
    updated_at?: string
  } | null

  if (typedUser === null) {
    return {
      id: '',
      email: '',
      // eslint-disable-next-line camelcase
      full_name: '',
      status: UserStatus.ACTIVE,
      // eslint-disable-next-line camelcase
      is_email_verified: false,
      // eslint-disable-next-line camelcase
      created_at: new Date().toISOString(),
      // eslint-disable-next-line camelcase
      updated_at: new Date().toISOString(),
    }
  }

  return {
    id: typedUser.id,
    email: typedUser.email,
    // eslint-disable-next-line camelcase
    full_name: typedUser.full_name ?? '',
    status: UserStatus.ACTIVE,
    // eslint-disable-next-line camelcase
    is_email_verified: Boolean(typedUser.is_email_verified),
    // eslint-disable-next-line camelcase
    created_at: typedUser.created_at,
    // eslint-disable-next-line camelcase
    updated_at: typedUser.updated_at ?? new Date().toISOString(),
  }
}

function getDefaultPreferences(): UserPreferences {
  return {
    theme: 'light',
    // eslint-disable-next-line camelcase
    notifications_email: true,
    // eslint-disable-next-line camelcase
    notifications_push: false,
    // eslint-disable-next-line camelcase
    notifications_sms: false,
    // eslint-disable-next-line camelcase
    marketing_emails: false,
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
  }
}

// Validation functions
function validateProfileData(data: UserUpdate): string | null {
  const typedData = data as { full_name?: string; phone?: string }

  if (
    typedData.full_name !== undefined &&
    typedData.full_name !== null &&
    typedData.full_name.trim().length < 2
  ) {
    return 'Nome deve ter pelo menos 2 caracteres'
  }

  if (typedData.phone !== undefined && typedData.phone !== null && !isValidPhone(typedData.phone)) {
    return 'Telefone inválido'
  }

  return null
}

function validatePasswordData(currentPassword: string, newPassword: string): string | null {
  if (currentPassword.length === 0) {
    return 'Senha atual é obrigatória'
  }

  if (newPassword.length < 8) {
    return 'Nova senha deve ter pelo menos 8 caracteres'
  }

  return null
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+\d{10,15}$/
  return phoneRegex.test(phone)
}
