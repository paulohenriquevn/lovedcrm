import { Save } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserPreferences } from '@/types/user'

interface PreferencesFormProps {
  preferences: UserPreferences
  isUpdating: boolean
  onSubmit: (data: UserPreferences) => void
}

// Theme selector component
function ThemeSelector({
  theme,
  onChange,
  disabled,
}: {
  theme: string
  onChange: (theme: 'light' | 'dark' | 'system') => void
  disabled: boolean
}): JSX.Element {
  return (
    <div className="space-y-2">
      <Label htmlFor="theme-select">Tema</Label>
      <Select value={theme} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="theme-select">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Claro</SelectItem>
          <SelectItem value="dark">Escuro</SelectItem>
          <SelectItem value="system">Sistema</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

// Notification checkbox component
function NotificationCheckbox({
  id,
  checked,
  onChange,
  disabled,
  label,
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled: boolean
  label: string
}): JSX.Element {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  )
}

// Notification options list component
function NotificationOptions({
  preferencesData,
  onUpdate,
  isUpdating,
}: {
  preferencesData: UserPreferences
  onUpdate: (field: keyof UserPreferences, checked: boolean) => void
  isUpdating: boolean
}): JSX.Element {
  return (
    <>
      <NotificationCheckbox
        id="email-notifications"
        checked={preferencesData.notifications_email}
        onChange={checked => onUpdate('notifications_email', checked)}
        disabled={isUpdating}
        label="Receber notificações por email"
      />

      <NotificationCheckbox
        id="push-notifications"
        checked={preferencesData.notifications_push}
        onChange={checked => onUpdate('notifications_push', checked)}
        disabled={isUpdating}
        label="Receber notificações push"
      />

      <NotificationCheckbox
        id="marketing-emails"
        checked={preferencesData.marketing_emails}
        onChange={checked => onUpdate('marketing_emails', checked)}
        disabled={isUpdating}
        label="Receber emails de marketing"
      />
    </>
  )
}

// Notifications section component
function NotificationsSection({
  preferencesData,
  setPreferencesData,
  isUpdating,
}: {
  preferencesData: UserPreferences
  setPreferencesData: (data: UserPreferences) => void
  isUpdating: boolean
}): JSX.Element {
  const updateNotification = (field: keyof UserPreferences, checked: boolean): void => {
    setPreferencesData({
      ...preferencesData,
      [field]: checked,
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">Notificações</h3>
      <NotificationOptions
        preferencesData={preferencesData}
        onUpdate={updateNotification}
        isUpdating={isUpdating}
      />
    </div>
  )
}

// Form submit button component
function SubmitButton({ isUpdating }: { isUpdating: boolean }): JSX.Element {
  return (
    <div className="flex justify-end">
      <Button type="submit" disabled={isUpdating} className="flex items-center gap-2">
        <Save className="h-4 w-4" />
        {isUpdating ? 'Salvando...' : 'Salvar preferências'}
      </Button>
    </div>
  )
}

export function PreferencesForm({
  preferences,
  isUpdating,
  onSubmit,
}: PreferencesFormProps): JSX.Element {
  const [preferencesData, setPreferencesData] = useState<UserPreferences>(preferences)

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onSubmit(preferencesData)
  }

  const handleThemeChange = (theme: 'light' | 'dark' | 'system'): void => {
    setPreferencesData({
      ...preferencesData,
      theme,
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-6">Preferências</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ThemeSelector
            theme={preferencesData.theme}
            onChange={handleThemeChange}
            disabled={isUpdating}
          />

          <NotificationsSection
            preferencesData={preferencesData}
            setPreferencesData={setPreferencesData}
            isUpdating={isUpdating}
          />

          <SubmitButton isUpdating={isUpdating} />
        </form>
      </CardContent>
    </Card>
  )
}
