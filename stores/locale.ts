/**
 * Locale Store - Zustand store for locale state management
 * Integrates with i18n system and user preferences
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { type Locale, defaultLocale, isValidLocale, getLocaleInfo } from '@/lib/i18n/config'
import { getBrowserLocale, getStoredLocale, setStoredLocale } from '@/lib/i18n/utils'

interface LocaleState {
  // State
  locale: Locale
  isInitialized: boolean
  isChanging: boolean

  // Locale info (derived)
  localeInfo: ReturnType<typeof getLocaleInfo>

  // Actions
  setLocale: (locale: Locale) => void
  initializeLocale: () => void
  switchLocale: (locale: Locale) => Promise<void>
  reset: () => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      // Initial state
      locale: defaultLocale,
      isInitialized: false,
      isChanging: false,
      localeInfo: getLocaleInfo(defaultLocale),

      // Set locale (internal)
      setLocale: (locale: Locale) => {
        if (!isValidLocale(locale)) {
          console.warn(`Invalid locale: ${locale}`)
          return
        }

        set({
          locale,
          localeInfo: getLocaleInfo(locale),
        })

        // Update localStorage
        setStoredLocale(locale)
      },

      // Initialize locale from storage/browser
      initializeLocale: () => {
        const stored = getStoredLocale()
        const browser = getBrowserLocale()
        const preferred = stored || browser || defaultLocale

        set({
          locale: preferred,
          localeInfo: getLocaleInfo(preferred),
          isInitialized: true,
        })
      },

      // Switch locale with navigation
      switchLocale: async (newLocale: Locale) => {
        const { locale: currentLocale } = get()

        if (!isValidLocale(newLocale) || newLocale === currentLocale) {
          return
        }

        set({ isChanging: true })

        try {
          // Update store state
          get().setLocale(newLocale)

          // Navigate to new locale URL
          const currentPath = window.location.pathname
          const currentLocalePrefix = `/${currentLocale}`

          // Remove current locale prefix if it exists
          const pathWithoutLocale = currentPath.startsWith(currentLocalePrefix)
            ? currentPath.slice(currentLocalePrefix.length) || '/'
            : currentPath

          // Build new URL
          const newPath =
            newLocale === defaultLocale ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`

          // Navigate (with full page reload for next-intl)
          window.location.href = newPath
        } catch (error) {
          console.error('Failed to switch locale:', error)
          set({ isChanging: false })
          throw error
        }
      },

      // Reset to default
      reset: () => {
        set({
          locale: defaultLocale,
          localeInfo: getLocaleInfo(defaultLocale),
          isInitialized: false,
          isChanging: false,
        })
        setStoredLocale(defaultLocale)
      },
    }),
    {
      name: 'locale-storage',
      partialize: state => ({
        locale: state.locale,
      }),
    }
  )
)

// Selectors for better performance
export const useCurrentLocale = () => useLocaleStore(state => state.locale)
export const useLocaleInfo = () => useLocaleStore(state => state.localeInfo)
export const useIsLocaleInitialized = () => useLocaleStore(state => state.isInitialized)
export const useIsLocaleChanging = () => useLocaleStore(state => state.isChanging)

// Actions
export const useLocaleActions = () =>
  useLocaleStore(state => ({
    setLocale: state.setLocale,
    switchLocale: state.switchLocale,
    initializeLocale: state.initializeLocale,
    reset: state.reset,
  }))

// Combined hook for common usage
export const useLocaleState = () => {
  const locale = useCurrentLocale()
  const localeInfo = useLocaleInfo()
  const isInitialized = useIsLocaleInitialized()
  const isChanging = useIsLocaleChanging()
  const actions = useLocaleActions()

  return {
    locale,
    localeInfo,
    isInitialized,
    isChanging,
    ...actions,
  }
}
