'use client'

import { Users, Settings, CreditCard, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSaasMode } from '@/hooks/use-saas-mode'
import { useAuthStore } from '@/stores/auth'

// Quick Actions Component
function QuickActionsCard({
  icon: Icon,
  title,
  description,
  action,
  href,
  color,
}: {
  icon: React.ElementType
  title: string
  description: string
  action: string
  href: string
  color: 'blue' | 'green' | 'purple'
}) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      button: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      button: 'text-green-600 hover:text-green-700 hover:bg-green-50',
    },
    purple: {
      bg: 'bg-yellow-50',
      icon: 'text-purple-600',
      button: 'text-purple-600 hover:text-purple-700 hover:bg-purple-50',
    },
  }[color]

  return (
    <Card className="w-full rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-3 ${colorClasses.bg} rounded-lg`}>
            <Icon className={`h-6 w-6 ${colorClasses.icon}`} />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {description}
            </CardDescription>
          </div>
        </div>
        <ArrowRight className="h-5 w-5" />
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <Link href={href}>
          <Button
            variant="outline"
            size="default"
            className={`w-full justify-center gap-2 ${colorClasses.button}`}
          >
            {action}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { organization } = useAuthStore()
  const locale = useLocale()
  const t = useTranslations('admin.dashboard')
  const { isB2C, isB2B } = useSaasMode()

  return (
    <div className="w-full h-full space-y-6">
      {/* Header simplificado */}
      <div className="w-full space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {isB2C ? 'My Dashboard' : 'Team Dashboard'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {organization && isB2B
                ? `${t('welcome')} - ${organization.name}`
                : isB2C
                  ? 'Manage your personal workspace'
                  : t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Cards */}
      <div className="w-full space-y-4">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">{t('quickActions')}</h2>
          <p className="text-sm text-muted-foreground">{t('quickActionsDescription')}</p>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <QuickActionsCard
            icon={Users}
            title={t('actions.team.title')}
            description={t('actions.team.description')}
            action={t('actions.team.action')}
            href={`/${locale}/admin/team`}
            color="blue"
          />
          <QuickActionsCard
            icon={Settings}
            title={t('actions.settings.title')}
            description={t('actions.settings.description')}
            action={t('actions.settings.action')}
            href={`/${locale}/admin/settings`}
            color="green"
          />
          <QuickActionsCard
            icon={CreditCard}
            title={t('actions.billing.title')}
            description={t('actions.billing.description')}
            action={t('actions.billing.action')}
            href={`/${locale}/admin/billing`}
            color="purple"
          />
        </div>
      </div>
    </div>
  )
}
