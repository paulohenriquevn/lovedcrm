import { LoadingSkeleton } from '@/components/settings/LoadingSkeleton'
import { ProfileSettingsView } from '@/components/settings/ProfileSettingsView'

interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

interface Preferences {
  theme: string
  notificationsEmail: boolean
  notificationsPush: boolean
  notificationsSms: boolean
  marketingEmails: boolean
  language: string
  timezone: string
}

interface ProfileTabContentProps {
  profile: User | null
  preferences: Preferences | null
  onUpdateProfile: (data: Partial<User>) => Promise<void>
  onUpdatePreferences: (data: Partial<Preferences>) => Promise<void>
  onChangePassword: () => void
}

export function ProfileTabContent({
  profile,
  preferences,
  onUpdateProfile,
  onUpdatePreferences,
  onChangePassword,
}: ProfileTabContentProps): JSX.Element {
  if (!profile || !preferences) {
    return <LoadingSkeleton />
  }

  return (
    <ProfileSettingsView
      user={profile}
      preferences={preferences}
      isUpdating={false}
      onUpdateProfile={data => {
        void onUpdateProfile(data)
      }}
      onUpdatePreferences={data => {
        void onUpdatePreferences(data)
      }}
      onChangePassword={onChangePassword}
    />
  )
}
