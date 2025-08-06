/**
 * i18n Utilities
 * Helper functions for internationalization
 */

import { type Locale, locales, defaultLocale, localeConfig } from './config'

/**
 * Get browser preferred locale
 */
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale
  }

  const [browserLang] = navigator.language.split('-')
  return locales.find(locale => locale === browserLang) ?? defaultLocale
}

/**
 * Get locale from localStorage
 */
// Helper to validate stored locale
function isValidStoredLocale(stored: string | null): stored is Locale {
  return (
    stored !== null && stored !== undefined && stored !== '' && locales.includes(stored as Locale)
  )
}

export function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem('locale')
    return isValidStoredLocale(stored) ? stored : null
  } catch {
    return null
  }
}

/**
 * Store locale in localStorage
 */
export function setStoredLocale(locale: Locale): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem('locale', locale)
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Format currency based on locale
 */
export function formatCurrency(amount: number, locale: Locale = defaultLocale): string {
  const config = localeConfig[locale]

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: config.currency,
    }).format(amount)
  } catch {
    // Fallback to simple format
    return `${config.currencySymbol}${amount.toFixed(2)}`
  }
}

/**
 * Format date based on locale
 */
export function formatDate(
  date: Date | string,
  locale: Locale = defaultLocale,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      ...options,
    }).format(dateObj)
  } catch {
    // Fallback to ISO string
    const [isoString] = dateObj.toISOString().split('T')
    return isoString ?? 'Invalid Date'
  }
}

/**
 * Format time based on locale
 */
export function formatTime(
  date: Date | string,
  locale: Locale = defaultLocale,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  try {
    return new Intl.DateTimeFormat(locale, {
      timeStyle: 'short',
      ...options,
    }).format(dateObj)
  } catch {
    // Fallback to simple format
    const [timeString] = dateObj.toTimeString().split(' ')
    return timeString?.slice(0, 5) ?? '00:00'
  }
}

// Time constants for better readability
const TIME_CONSTANTS = {
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86_400,
  MONTH: 2_592_000,
  YEAR: 31_536_000,
} as const

// Time unit mapping for relative time formatting
const TIME_UNIT_MAP = [
  { threshold: TIME_CONSTANTS.MINUTE, divisor: 1, unit: 'second' as const },
  { threshold: TIME_CONSTANTS.HOUR, divisor: TIME_CONSTANTS.MINUTE, unit: 'minute' as const },
  { threshold: TIME_CONSTANTS.DAY, divisor: TIME_CONSTANTS.HOUR, unit: 'hour' as const },
  { threshold: TIME_CONSTANTS.MONTH, divisor: TIME_CONSTANTS.DAY, unit: 'day' as const },
  { threshold: TIME_CONSTANTS.YEAR, divisor: TIME_CONSTANTS.MONTH, unit: 'month' as const },
] as const

// Helper function for relative time formatting (simplified)
function formatRelativeTimeIntl(diffInSeconds: number, locale: Locale): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  for (const { threshold, divisor, unit } of TIME_UNIT_MAP) {
    if (diffInSeconds < threshold) {
      return rtf.format(-Math.floor(diffInSeconds / divisor), unit)
    }
  }

  // Fallback to years
  return rtf.format(-Math.floor(diffInSeconds / TIME_CONSTANTS.YEAR), 'year')
}

// Helper function for fallback relative time formatting
function formatRelativeTimeFallback(diffInSeconds: number, dateObj: Date, locale: Locale): string {
  if (diffInSeconds < TIME_CONSTANTS.MINUTE) {
    return 'just now'
  }
  if (diffInSeconds < TIME_CONSTANTS.HOUR) {
    return `${Math.floor(diffInSeconds / TIME_CONSTANTS.MINUTE)}m ago`
  }
  if (diffInSeconds < TIME_CONSTANTS.DAY) {
    return `${Math.floor(diffInSeconds / TIME_CONSTANTS.HOUR)}h ago`
  }
  return formatDate(dateObj, locale)
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string, locale: Locale = defaultLocale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  try {
    return formatRelativeTimeIntl(diffInSeconds, locale)
  } catch {
    return formatRelativeTimeFallback(diffInSeconds, dateObj, locale)
  }
}

/**
 * Get direction (LTR/RTL) for locale
 */
export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return localeConfig[locale].dir
}

/**
 * Get locale display name
 */
export function getLocaleDisplayName(locale: Locale): string {
  const config = localeConfig[locale]
  return `${config.flag} ${config.name}`
}

// Pluralization options interface
interface PluralizeOptions {
  plural?: string
  locale?: Locale
}

// Helper to get plural form
function getPluralForm(singular: string, plural?: string): string {
  return plural ?? `${singular}s`
}

/**
 * Pluralization helper (reduced parameters)
 */
export function pluralize(count: number, singular: string, options: PluralizeOptions = {}): string {
  const { plural, locale = defaultLocale } = options
  const pluralForm = getPluralForm(singular, plural)

  // Use Intl.PluralRules for proper pluralization
  try {
    const pr = new Intl.PluralRules(locale)
    const rule = pr.select(count)
    return rule === 'one' ? singular : pluralForm
  } catch {
    // Fallback to simple English rules
    return count === 1 ? singular : pluralForm
  }
}
