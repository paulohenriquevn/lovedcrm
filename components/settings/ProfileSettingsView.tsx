import { User, UserUpdate, UserPreferences } from '@/types/user'

import { PreferencesForm } from './PreferencesForm'
import { ProfileForm } from './ProfileForm'

interface ProfileSettingsViewProps {
  user: User
  preferences: UserPreferences
  isUpdating: boolean
  onUpdateProfile: (data: UserUpdate) => void
  onUpdatePreferences: (data: UserPreferences) => void
  onChangePassword: () => void
}

export function ProfileSettingsView({
  user,
  preferences,
  isUpdating,
  onUpdateProfile,
  onUpdatePreferences,
  onChangePassword,
}: ProfileSettingsViewProps): JSX.Element {
  return (
    <div className="space-y-6">
      <ProfileForm
        user={user}
        isUpdating={isUpdating}
        onSubmit={onUpdateProfile}
        onChangePassword={onChangePassword}
      />

      <PreferencesForm
        preferences={preferences}
        isUpdating={isUpdating}
        onSubmit={onUpdatePreferences}
      />
    </div>
  )
}
