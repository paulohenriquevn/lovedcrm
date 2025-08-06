/**
 * Localized Layout - Layout for routes with locale parameter
 * Handles locale-specific configuration and provides locale context
 */

import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

import { ConditionalNavbar } from '@/components/conditional-navbar'
import { AuthProvider } from '@/components/providers/auth-provider'
import { type Locale, locales } from '@/lib/i18n/config'
// import { getDirection } from '@/lib/i18n/utils' // For future RTL support

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default async function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  // Validate locale parameter
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  // Get messages for the current locale
  const messages = await getMessages({ locale })

  // Get text direction for the locale (used for future RTL support)
  // const direction = getDirection(locale as Locale)

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <AuthProvider>
        <div className="relative flex min-h-screen flex-col">
          <ConditionalNavbar />
          <main className="flex-1">{children}</main>
        </div>
      </AuthProvider>
    </NextIntlClientProvider>
  )
}

// Generate static params for all supported locales
export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}
