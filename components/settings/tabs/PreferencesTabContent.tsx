import { LoadingSkeleton } from '@/components/settings/LoadingSkeleton'
import { PreferencesForm } from '@/components/settings/PreferencesForm'
import { Card, CardContent } from '@/components/ui/card'

interface Preferences {
  theme: string
  notificationsEmail: boolean
  notificationsPush: boolean
  notificationsSms: boolean
  marketingEmails: boolean
  language: string
  timezone: string
}

interface PreferencesTabContentProps {
  preferences: Preferences | null
  onUpdatePreferences: (data: Preferences) => Promise<void>
}

export function PreferencesTabContent({
  preferences,
  onUpdatePreferences,
}: PreferencesTabContentProps): JSX.Element {
  if (!preferences) {
    return <LoadingSkeleton />
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-6">Preferências do Sistema</h2>
        <PreferencesForm
          preferences={preferences}
          isUpdating={false}
          onSubmit={data => {
            void onUpdatePreferences(data)
          }}
        />
      </CardContent>
    </Card>
  )
}
