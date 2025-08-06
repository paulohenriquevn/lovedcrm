/**
 * i18n Configuration
 * Central configuration for internationalization using next-intl
 */

import { getRequestConfig } from 'next-intl/server'

// Importar mensagens estaticamente
import enMessages from '../../messages/en.json'
import esMessages from '../../messages/es.json'
import ptMessages from '../../messages/pt.json'

// Supported locales
export const locales = ['en', 'pt', 'es'] as const
export type Locale = (typeof locales)[number]

// Default locale
export const defaultLocale: Locale = 'en'

// Locale configuration
export const localeConfig = {
  en: {
    name: 'English',
    flag: '🇺🇸',
    dir: 'ltr' as const,
    dateFormat: 'MM/dd/yyyy',
    timeFormat: 'h:mm a',
    currency: 'USD',
    currencySymbol: '$',
  },
  pt: {
    name: 'Português',
    flag: '🇧🇷',
    dir: 'ltr' as const,
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    currency: 'BRL',
    currencySymbol: 'R$',
  },
  es: {
    name: 'Español',
    flag: '🇪🇸',
    dir: 'ltr' as const,
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    currency: 'EUR',
    currencySymbol: '€',
  },
} as const

// Validate locale
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

// Get locale info
export function getLocaleInfo(locale: Locale): (typeof localeConfig)[Locale] {
  return localeConfig[locale]
}

//Object com as mensagens estáticas
const messages = {
  en: enMessages,
  pt: ptMessages,
  es: esMessages,
} as const

// next-intl configuration factory function
const createRequestConfig = getRequestConfig(({ locale }) => {
  // Validate and fallback to default locale if invalid
  const validLocale =
    locale !== null && locale !== undefined && locale !== '' && isValidLocale(locale)
      ? locale
      : 'en'

  return {
    locale: validLocale,
    messages: messages[validLocale as keyof typeof messages],
    timeZone: 'UTC', // Will be overridden by user preferences
    now: new Date(),
  }
})

// Export as named export (preferred) and keep default for next-intl compatibility
export { createRequestConfig }

// eslint-disable-next-line import/no-default-export
export default createRequestConfig
