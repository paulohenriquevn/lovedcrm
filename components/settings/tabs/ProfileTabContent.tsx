import { LoadingSkeleton } from '@/components/settings/LoadingSkeleton'
import { ProfileSettingsView } from '@/components/settings/ProfileSettingsView'
import { User, UserPreferences } from '@/types/user'

interface ProfileTabContentProps {
  profile: User | null
  preferences: UserPreferences | null
  onUpdateProfile: (data: Partial<User>) => Promise<void>
  onUpdatePreferences: (data: Partial<UserPreferences>) => Promise<void>
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
