import { useEffect } from 'react'

import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

interface DefaultPreferences {
  theme: string
  notificationsEmail: boolean
  notificationsPush: boolean
  notificationsSms: boolean
  marketingEmails: boolean
  language: string
  timezone: string
}

const DEFAULT_PREFERENCES: DefaultPreferences = {
  theme: 'system',
  notificationsEmail: true,
  notificationsPush: true,
  notificationsSms: false,
  marketingEmails: false,
  language: 'pt-BR',
  timezone: 'America/Sao_Paulo',
}

export function useSettingsData(): void {
  const { user } = useAuthStore()
  const { setProfile, setPreferences, setLoading } = useSettingsStore()

  useEffect(() => {
    const loadUserData = async (): Promise<void> => {
      if (!user) {
        return
      }

      try {
        setLoading(true)
        const { settingsService } = await import('@/services/settings')

        // Load user preferences
        try {
          const userPreferences = await settingsService.getUserPreferences()
          setPreferences(userPreferences)
        } catch {
          // If API call fails, use default preferences
          setPreferences(DEFAULT_PREFERENCES)
        }

        // Use user from auth store as profile
        setProfile(user)
      } catch {
        // Error handled silently - default preferences will be used
      } finally {
        setLoading(false)
      }
    }

    void loadUserData()
  }, [user, setProfile, setPreferences, setLoading])
}
