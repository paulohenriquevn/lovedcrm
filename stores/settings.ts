/**
 * Store para gerenciamento de configurações.
 */
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { UserResponse, UserPreferences } from '@/types/user'

interface SettingsState {
  // Estado
  profile: UserResponse | null
  preferences: UserPreferences | null
  isLoading: boolean
  error: string | null
  isUpdating: boolean

  // Ações
  setProfile: (profile: UserResponse) => void
  setPreferences: (preferences: UserPreferences) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setUpdating: (isUpdating: boolean) => void
  reset: () => void
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    set => ({
      // Estado inicial
      profile: null,
      preferences: null,
      isLoading: false,
      error: null,
      isUpdating: false,

      // Ações
      setProfile: profile => set({ profile }),
      setPreferences: preferences => set({ preferences }),
      setLoading: isLoading => set({ isLoading }),
      setError: error => set({ error }),
      setUpdating: isUpdating => set({ isUpdating }),
      reset: () =>
        set({
          profile: null,
          preferences: null,
          isLoading: false,
          error: null,
          isUpdating: false,
        }),
    }),
    {
      name: 'settings-store',
    }
  )
)
