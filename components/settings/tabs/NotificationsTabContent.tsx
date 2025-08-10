import { NotificationSettingsView } from '@/components/settings/NotificationSettingsView'
import { Card, CardContent } from '@/components/ui/card'

export interface NotificationPreferencesData {
  notificationsEmail: boolean
  notificationsPush: boolean
  notificationsSms: boolean
  marketingEmails: boolean
  notificationTypes: Record<string, { email: boolean; push: boolean; sms: boolean }>
}

interface NotificationsTabContentProps {
  onSavePreferences: (data: NotificationPreferencesData) => Promise<void>
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
