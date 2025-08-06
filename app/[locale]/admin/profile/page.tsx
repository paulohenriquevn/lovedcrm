'use client'

import {
  LoadingState,
  PageHeader,
  ProfileContent,
  useProfileForm,
  usePasswordForm,
  useProfileSubmit,
  usePasswordSubmit,
  usePasswordVisibility,
} from '@/components/profile'
import { useAuthStore } from '@/stores/auth'
import { TIMEZONE_OPTIONS, LANGUAGE_OPTIONS, type ProfileUser } from '@/types/profile-forms'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()

  // Initialize forms and handlers
  const profileForm = useProfileForm(user as ProfileUser | null)
  const passwordForm = usePasswordForm()
  const passwordVisibility = usePasswordVisibility()

  const { handleSubmit: handleProfileSubmit, isLoading: isProfileLoading } = useProfileSubmit(
    user as ProfileUser | null,
    setUser
  )
  const { handleSubmit: handlePasswordSubmit, isLoading: isPasswordLoading } =
    usePasswordSubmit(passwordForm)

  const handleProfileSubmitWrapper = (data: Parameters<typeof handleProfileSubmit>[0]) => {
    void handleProfileSubmit(data)
  }

  const handlePasswordSubmitWrapper = (data: Parameters<typeof handlePasswordSubmit>[0]) => {
    void handlePasswordSubmit(data)
  }

  // Show loading state if user is not loaded
  if (!user) {
    return <LoadingState />
  }

  return (
    <div className="w-full h-full space-y-6">
      <PageHeader />
      <ProfileContent
        user={user as ProfileUser}
        profileForm={profileForm}
        passwordForm={passwordForm}
        isProfileLoading={isProfileLoading}
        isPasswordLoading={isPasswordLoading}
        passwordVisibility={passwordVisibility}
        handleProfileSubmit={handleProfileSubmitWrapper}
        handlePasswordSubmit={handlePasswordSubmitWrapper}
        timezoneOptions={TIMEZONE_OPTIONS}
        languageOptions={LANGUAGE_OPTIONS}
      />
    </div>
  )
}
