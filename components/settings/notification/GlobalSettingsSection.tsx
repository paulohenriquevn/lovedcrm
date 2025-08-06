import { Bell, Mail, Smartphone, MessageSquare } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface GlobalSettingsCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  onTest: () => void
}

function GlobalSettingsCard({
  icon: Icon,
  label,
  checked,
  onCheckedChange,
  onTest,
}: GlobalSettingsCardProps): JSX.Element {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <Label className="font-medium">{label}</Label>
          </div>
          <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
        <Button onClick={onTest} variant="outline" size="sm" className="w-full">
          Teste
        </Button>
      </CardContent>
    </Card>
  )
}

interface GlobalSettingsSectionProps {
  globalSettings: {
    emailEnabled: boolean
    pushEnabled: boolean
    smsEnabled: boolean
  }
  updateGlobalSetting: (setting: string, value: boolean) => void
  onTest: (type: 'email' | 'push' | 'sms') => void
}

export function GlobalSettingsSection({
  globalSettings,
  updateGlobalSetting,
  onTest,
}: GlobalSettingsSectionProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-muted-foreground" />
          <div>
            <CardTitle className="text-lg font-semibold">Configurações Globais</CardTitle>
            <CardDescription>Configure as preferências gerais de notificação</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlobalSettingsCard
            icon={Mail}
            label="Email"
            checked={globalSettings.emailEnabled}
            onCheckedChange={(checked): void => updateGlobalSetting('emailEnabled', checked)}
            onTest={(): void => onTest('email')}
          />

          <GlobalSettingsCard
            icon={Smartphone}
            label="Push"
            checked={globalSettings.pushEnabled}
            onCheckedChange={(checked): void => updateGlobalSetting('pushEnabled', checked)}
            onTest={(): void => onTest('push')}
          />

          <GlobalSettingsCard
            icon={MessageSquare}
            label="SMS"
            checked={globalSettings.smsEnabled}
            onCheckedChange={(checked): void => updateGlobalSetting('smsEnabled', checked)}
            onTest={(): void => onTest('sms')}
          />
        </div>
      </CardContent>
    </Card>
  )
}
