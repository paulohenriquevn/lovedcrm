'use client'

import { AccountInfoCard, ProfileFormCard, PasswordChangeCard } from './cards'

import type {
  ProfileUser,
  ProfileFormHook,
  PasswordFormHook,
  ProfileFormData,
  PasswordFormData,
  PasswordVisibilityState,
  SelectOption,
} from '@/types/profile-forms'

// Loading state component
export function LoadingState(): JSX.Element {
  return (
    <div className="w-full h-full space-y-6">
      <div className="w-full space-y-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-sm text-muted-foreground">Carregando informações...</p>
        </div>
      </div>
    </div>
  )
}

// Page header component
export function PageHeader(): JSX.Element {
  return (
    <div className="w-full space-y-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>
    </div>
  )
}

// Main profile content component
export function ProfileContent({
  user,
  profileForm,
  passwordForm,
  isProfileLoading,
  isPasswordLoading,
  passwordVisibility,
  handleProfileSubmit,
  handlePasswordSubmit,
  timezoneOptions,
  languageOptions,
}: {
  user: ProfileUser
  profileForm: ProfileFormHook
  passwordForm: PasswordFormHook
  isProfileLoading: boolean
  isPasswordLoading: boolean
  passwordVisibility: PasswordVisibilityState
  handleProfileSubmit: (data: ProfileFormData) => void
  handlePasswordSubmit: (data: PasswordFormData) => void
  timezoneOptions: SelectOption[]
  languageOptions: SelectOption[]
}): JSX.Element {
  return (
    <div className="w-full space-y-4">
      <div className="space-y-6 w-full">
        <AccountInfoCard user={user} />
        <ProfileFormCard
          form={profileForm}
          isLoading={isProfileLoading}
          onSubmit={handleProfileSubmit}
          timezoneOptions={timezoneOptions}
          languageOptions={languageOptions}
        />
        <PasswordChangeCard
          form={passwordForm}
          isLoading={isPasswordLoading}
          passwordVisibility={passwordVisibility}
          onSubmit={handlePasswordSubmit}
        />
      </div>
    </div>
  )
}
