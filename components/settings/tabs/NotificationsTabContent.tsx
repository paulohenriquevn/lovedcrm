import { NotificationSettingsView } from '@/components/settings/NotificationSettingsView'
import { Card, CardContent } from '@/components/ui/card'

interface NotificationsTabContentProps {
  onSavePreferences: (data: Record<string, unknown>) => Promise<void>
}

export function NotificationsTabContent({
  onSavePreferences,
}: NotificationsTabContentProps): JSX.Element {
  return (
    <Card>
      <CardContent className="p-6">
        <NotificationSettingsView onSavePreferences={onSavePreferences} />
      </CardContent>
    </Card>
  )
}
