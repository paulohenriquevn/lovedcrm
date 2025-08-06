/**
 * Custom hooks for i18n locale management
 * Integrates with next-intl and provides utilities for locale handling
 */

'use client'

import { useLocale as useNextIntlLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

import {
  type Locale,
  localeConfig,
  getLocaleInfo,
  isValidLocale,
  defaultLocale,
} from '@/lib/i18n/config'
import {
  getBrowserLocale,
  getStoredLocale,
  setStoredLocale,
  formatCurrency,
  formatDate,
  formatTime,
  formatRelativeTime,
  getDirection,
} from '@/lib/i18n/utils'

/**
 * Main locale hook - provides current locale and utilities
 */
export function useLocale() {
  const currentLocale = useNextIntlLocale() as Locale
  const t = useTranslations()

  const localeInfo = getLocaleInfo(currentLocale)

  return {
    // Current locale
    locale: currentLocale,
    localeInfo,

    // Utilities
    isRTL: getDirection(currentLocale) === 'rtl',
    direction: getDirection(currentLocale),

    // Formatting functions bound to current locale
    formatCurrency: useCallback(
      (amount: number) => formatCurrency(amount, currentLocale),
      [currentLocale]
    ),
    formatDate: useCallback(
      (date: Date | string, options?: Intl.DateTimeFormatOptions) =>
        formatDate(date, currentLocale, options),
      [currentLocale]
    ),
    formatTime: useCallback(
      (date: Date | string, options?: Intl.DateTimeFormatOptions) =>
        formatTime(date, currentLocale, options),
      [currentLocale]
    ),
    formatRelativeTime: useCallback(
      (date: Date | string) => formatRelativeTime(date, currentLocale),
      [currentLocale]
    ),

    // Translation function
    t,
  }
}

/**
 * Locale persistence hook - manages localStorage and user preferences
 */
export function useLocalePersistence() {
  const [storedLocale, setStoredLocaleState] = useState<Locale | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Handle hydration
  useEffect(() => {
    setIsClient(true)
    setStoredLocaleState(getStoredLocale())
  }, [])

  const updateStoredLocale = useCallback((locale: Locale) => {
    setStoredLocale(locale)
    setStoredLocaleState(locale)
  }, [])

  const getPreferredLocale = useCallback((): Locale => {
    if (!isClient) return defaultLocale

    // Priority: stored > browser > default
    return storedLocale || getBrowserLocale() || defaultLocale
  }, [isClient, storedLocale])

  return {
    storedLocale,
    isClient,
    updateStoredLocale,
    getPreferredLocale,
  }
}

/**
 * Locale switching hook - handles navigation and persistence
 */
export function useLocaleSwitch() {
  const currentLocale = useNextIntlLocale() as Locale
  const { updateStoredLocale } = useLocalePersistence()

  const switchLocale = useCallback(
    async (newLocale: Locale) => {
      if (!isValidLocale(newLocale) || newLocale === currentLocale) {
        return
      }

      try {
        // Update localStorage
        updateStoredLocale(newLocale)

        // Get current path without locale prefix
        const currentPath = window.location.pathname
        const currentLocalePrefix = `/${currentLocale}`

        // Remove current locale prefix if it exists
        const pathWithoutLocale = currentPath.startsWith(currentLocalePrefix)
          ? currentPath.slice(currentLocalePrefix.length) || '/'
          : currentPath

        // Build new URL with new locale
        const newPath =
          newLocale === defaultLocale ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`

        // Navigate to new locale (with full page reload to update next-intl)
        window.location.href = newPath
      } catch (error) {
        console.error('Failed to switch locale:', error)
        throw error
      }
    },
    [currentLocale, updateStoredLocale]
  )

  return {
    currentLocale,
    switchLocale,
    availableLocales: Object.keys(localeConfig) as Locale[],
    canSwitchTo: (locale: Locale) => isValidLocale(locale) && locale !== currentLocale,
  }
}

/**
 * Translation helpers hook - provides commonly used translation functions
 */
export function useTranslationHelpers() {
  const tCommon = useTranslations('common')
  const tError = useTranslations('error')
  const tForm = useTranslations('form')
  const tNavigation = useTranslations('navigation')

  return {
    // Common translations
    tCommon,
    tError,
    tForm,
    tNavigation,

    // Quick access to common strings
    loading: tCommon('loading'),
    error: tCommon('error'),
    success: tCommon('success'),
    cancel: tCommon('cancel'),
    save: tCommon('save'),

    // Form helpers
    required: tForm('required'),
    invalidEmail: tForm('invalidEmail'),

    // Error messages
    genericError: tError('generic'),
    networkError: tError('network'),
    unauthorized: tError('unauthorized'),
  }
}

/**
 * Number formatting hook - provides locale-aware number formatting
 */
export function useNumberFormatting() {
  const { locale, localeInfo } = useLocale()

  const formatNumber = useCallback(
    (number: number, options?: Intl.NumberFormatOptions): string => {
      try {
        return new Intl.NumberFormat(locale, options).format(number)
      } catch {
        return number.toString()
      }
    },
    [locale]
  )

  const formatPercent = useCallback(
    (number: number): string => {
      return formatNumber(number / 100, { style: 'percent' })
    },
    [formatNumber]
  )

  const formatCompactNumber = useCallback(
    (number: number): string => {
      return formatNumber(number, { notation: 'compact' })
    },
    [formatNumber]
  )

  return {
    formatNumber,
    formatPercent,
    formatCompactNumber,
    formatCurrency: useCallback((amount: number) => formatCurrency(amount, locale), [locale]),
    currencySymbol: localeInfo.currencySymbol,
    currency: localeInfo.currency,
  }
}

/**
 * Date formatting hook - provides locale-aware date formatting
 */
export function useDateFormatting() {
  const { locale, localeInfo } = useLocale()

  const formatDateShort = useCallback(
    (date: Date | string): string => {
      return formatDate(date, locale, { dateStyle: 'short' })
    },
    [locale]
  )

  const formatDateMedium = useCallback(
    (date: Date | string): string => {
      return formatDate(date, locale, { dateStyle: 'medium' })
    },
    [locale]
  )

  const formatDateLong = useCallback(
    (date: Date | string): string => {
      return formatDate(date, locale, { dateStyle: 'long' })
    },
    [locale]
  )

  const formatDateTime = useCallback(
    (date: Date | string): string => {
      return formatDate(date, locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    },
    [locale]
  )

  return {
    formatDateShort,
    formatDateMedium,
    formatDateLong,
    formatDateTime,
    formatTime: useCallback((date: Date | string) => formatTime(date, locale), [locale]),
    formatRelativeTime: useCallback(
      (date: Date | string) => formatRelativeTime(date, locale),
      [locale]
    ),
    dateFormat: localeInfo.dateFormat,
    timeFormat: localeInfo.timeFormat,
  }
}
