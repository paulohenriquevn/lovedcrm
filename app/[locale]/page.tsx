/**
 * Localized Homepage - Example of i18n usage
 * Demonstrates translation usage with next-intl (Client Component)
 */

'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { useLocalizedRouter } from '@/hooks/use-localized-router'

export default function LocalizedHomePage() {
  const tCommon = useTranslations('common')
  const tAuth = useTranslations('auth')
  const { createLocalizedPath } = useLocalizedRouter()

  return (
    <div className="container mx-auto px-4">
      <section className="min-h-screen flex flex-col items-center justify-center text-center py-20">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
          {tCommon('home')} - NextJS + FastAPI SaaS
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Complete SaaS starter with multi-tenant architecture, authentication, billing, and full
          internationalization support.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8">
          <Link href={createLocalizedPath('/auth/register')}>
            <Button size="lg">{tAuth('register.title')}</Button>
          </Link>

          <Link href={createLocalizedPath('/auth/login')}>
            <Button variant="secondary" size="lg">
              {tAuth('login.title')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {tCommon('features.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {tCommon('features.subtitle')}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="text-center space-y-4 p-6 rounded-lg border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto" />
            <h3 className="text-xl font-semibold">{tCommon('features.performance.title')}</h3>
            <p className="text-muted-foreground">{tCommon('features.performance.description')}</p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-lg border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto" />
            <h3 className="text-xl font-semibold">{tCommon('features.security.title')}</h3>
            <p className="text-muted-foreground">{tCommon('features.security.description')}</p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-lg border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto" />
            <h3 className="text-xl font-semibold">{tCommon('features.analytics.title')}</h3>
            <p className="text-muted-foreground">{tCommon('features.analytics.description')}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
