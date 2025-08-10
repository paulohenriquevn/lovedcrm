import { LoadingSkeleton } from '@/components/settings/LoadingSkeleton'
import { PreferencesForm } from '@/components/settings/PreferencesForm'
import { Card, CardContent } from '@/components/ui/card'
import { UserPreferences } from '@/types/user'

interface PreferencesTabContentProps {
  preferences: UserPreferences | null
  onUpdatePreferences: (data: UserPreferences) => Promise<void>
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
