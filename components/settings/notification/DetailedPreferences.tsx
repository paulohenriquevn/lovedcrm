import { Mail, Smartphone, MessageSquare, Megaphone } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

interface NotificationPreference {
  id: string
  title: string
  description: string
  email: boolean
  push: boolean
  sms: boolean
}

interface DetailedPreferencesProps {
  preferences: NotificationPreference[]
  onUpdatePreference: (id: string, type: 'email' | 'push' | 'sms', value: boolean) => void
}

export function DetailedPreferences({
  preferences,
  onUpdatePreference,
}: DetailedPreferencesProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Megaphone className="h-6 w-6 text-muted-foreground" />
          <div>
            <CardTitle className="text-lg font-semibold">Preferências Detalhadas</CardTitle>
            <CardDescription>Configure notificações específicas por categoria</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {preferences.map(preference => (
            <Card key={preference.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium">{preference.title}</h4>
                    <p className="text-muted-foreground">{preference.description}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Switch
                        checked={preference.email}
                        onCheckedChange={(checked): void =>
                          onUpdatePreference(preference.id, 'email', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <Switch
                        checked={preference.push}
                        onCheckedChange={(checked): void =>
                          onUpdatePreference(preference.id, 'push', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <Switch
                        checked={preference.sms}
                        onCheckedChange={(checked): void =>
                          onUpdatePreference(preference.id, 'sms', checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
