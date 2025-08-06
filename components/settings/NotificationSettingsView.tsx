'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'

import { DetailedPreferences } from './notification/DetailedPreferences'
import { GlobalSettingsSection } from './notification/GlobalSettingsSection'
import { QuietHoursSettings } from './notification/QuietHoursSettings'

interface NotificationPreference {
  id: string
  title: string
  description: string
  email: boolean
  push: boolean
  sms: boolean
}

interface NotificationPreferencesData {
  notificationsEmail: boolean
  notificationsPush: boolean
  notificationsSms: boolean
  marketingEmails: boolean
  notificationTypes: Record<string, { email: boolean; push: boolean; sms: boolean }>
}

interface NotificationSettingsViewProps {
  onSavePreferences: (preferences: NotificationPreferencesData) => Promise<void>
}

function handleTestNotification(_type: 'email' | 'push' | 'sms'): void {
  // TODO: Implementar teste de notificação
}

function useNotificationSettings(): {
  preferences: NotificationPreference[]
  globalSettings: {
    emailEnabled: boolean
    pushEnabled: boolean
    smsEnabled: boolean
    marketingEnabled: boolean
    quietHours: boolean
    quietStart: string
    quietEnd: string
  }
  updatePreference: (id: string, type: 'email' | 'push' | 'sms', value: boolean) => void
  updateGlobalSetting: (setting: string, value: boolean | string) => void
} {
  const [preferences, setPreferences] = React.useState<NotificationPreference[]>([
    {
      id: 'account',
      title: 'Atividade da Conta',
      description: 'Login, alterações de senha, atualizações de segurança',
      email: true,
      push: true,
      sms: false,
    },
    {
      id: 'team',
      title: 'Atividade da Equipe',
      description: 'Novos membros, mudanças de role, convites',
      email: true,
      push: false,
      sms: false,
    },
    {
      id: 'billing',
      title: 'Faturamento',
      description: 'Faturas, pagamentos, alterações de plano',
      email: true,
      push: false,
      sms: false,
    },
    {
      id: 'marketing',
      title: 'Marketing',
      description: 'Novidades, dicas, atualizações do produto',
      email: false,
      push: false,
      sms: false,
    },
  ])

  const [globalSettings, setGlobalSettings] = React.useState({
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    marketingEnabled: false,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00',
  })

  const updatePreference = (id: string, type: 'email' | 'push' | 'sms', value: boolean): void => {
    setPreferences(prev => prev.map(pref => (pref.id === id ? { ...pref, [type]: value } : pref)))
  }

  const updateGlobalSetting = (setting: string, value: boolean | string): void => {
    setGlobalSettings(prev => ({ ...prev, [setting]: value }))
  }

  return {
    preferences,
    globalSettings,
    updatePreference,
    updateGlobalSetting,
  }
}

export function NotificationSettingsView({
  onSavePreferences,
}: NotificationSettingsViewProps): JSX.Element {
  const { preferences, globalSettings, updatePreference, updateGlobalSetting } =
    useNotificationSettings()

  const handleSavePreferences = async (): Promise<void> => {
    try {
      // Transform to format expected by backend
      const notificationPrefs: NotificationPreferencesData = {
        notificationsEmail: globalSettings.emailEnabled,
        notificationsPush: globalSettings.pushEnabled,
        notificationsSms: globalSettings.smsEnabled,
        marketingEmails: globalSettings.marketingEnabled,
        // Add individual preferences
        notificationTypes: Object.fromEntries(
          preferences.map(pref => [
            pref.id,
            {
              email: pref.email,
              push: pref.push,
              sms: pref.sms,
            },
          ])
        ),
      }

      await onSavePreferences(notificationPrefs)
      // TODO: Show success toast
    } catch {
      // TODO: Show error toast
    }
  }

  return (
    <div className="space-y-6">
      <GlobalSettingsSection
        globalSettings={globalSettings}
        updateGlobalSetting={updateGlobalSetting}
        onTest={handleTestNotification}
      />

      <div className="mt-6">
        <QuietHoursSettings
          quietHours={globalSettings.quietHours}
          quietStart={globalSettings.quietStart}
          quietEnd={globalSettings.quietEnd}
          onToggleQuietHours={(checked): void => updateGlobalSetting('quietHours', checked)}
          onUpdateTime={updateGlobalSetting}
        />
      </div>

      <div className="mt-6">
        <DetailedPreferences preferences={preferences} onUpdatePreference={updatePreference} />
      </div>

      <div className="flex justify-end pt-6">
        <Button
          onClick={(): void => {
            void handleSavePreferences()
          }}
        >
          Salvar Preferências
        </Button>
      </div>
    </div>
  )
}
