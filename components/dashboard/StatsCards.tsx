import {
  TrendingUp,
  TrendingDown,
  UserPlus,
  CreditCard,
  Building2,
  BarChart3,
  Zap,
} from 'lucide-react'

import { FeatureGate } from '@/components/common/feature-gate'
import { Card, CardContent } from '@/components/ui/card'

import { DashboardStats } from '../../types/admin'

// Individual stat card generators
export function createUserStatsCard(stats: DashboardStats | null): {
  readonly title: string
  readonly value: number
  readonly change: number
  readonly icon: React.ElementType
  readonly color: string
} {
  return {
    title: 'Total de Usuários',
    value: stats?.totalUsers ?? 0,
    change: stats?.newSignups ?? 0,
    icon: UserPlus,
    color: 'blue',
  } as const
}

export function createActiveUsersCard(stats: DashboardStats | null): {
  readonly title: string
  readonly value: number
  readonly change: number
  readonly icon: React.ElementType
  readonly color: string
} {
  return {
    title: 'Usuários Ativos',
    value: stats?.activeUsers ?? 0,
    change: stats?.conversionRate ?? 0,
    icon: Building2,
    color: 'green',
  } as const
}

export function createRevenueCard(stats: DashboardStats | null): {
  readonly title: string
  readonly value: string
  readonly change: number
  readonly icon: React.ElementType
  readonly color: string
} {
  return {
    title: 'Receita Total',
    value: `R$ ${(stats?.totalRevenue ?? 0).toLocaleString('pt-BR')}`,
    change: stats?.churnRate ?? 0,
    icon: CreditCard,
    color: 'purple',
  } as const
}

export function createOrganizationsCard(stats: DashboardStats | null): {
  readonly title: string
  readonly value: number
  readonly change: number
  readonly icon: React.ElementType
  readonly color: string
} {
  return {
    title: 'Organizações',
    value: stats?.totalOrganizations ?? 0,
    change: stats?.newSignups ?? 0,
    icon: TrendingUp,
    color: 'orange',
  } as const
}

// Helper function to generate stat cards data
export function generateStatCardsData(
  stats: DashboardStats | null
): readonly [
  ReturnType<typeof createUserStatsCard>,
  ReturnType<typeof createActiveUsersCard>,
  ReturnType<typeof createRevenueCard>,
  ReturnType<typeof createOrganizationsCard>,
] {
  return [
    createUserStatsCard(stats),
    createActiveUsersCard(stats),
    createRevenueCard(stats),
    createOrganizationsCard(stats),
  ] as const
}

// Stat card icon component
export function StatCardIcon({
  icon: Icon,
  color,
}: {
  icon: React.ElementType
  color: string
}): JSX.Element {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  }

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} rounded-md p-3`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
  )
}

// Stat card content component
export function StatCardContent({
  title,
  value,
}: {
  title: string
  value: string | number
}): JSX.Element {
  return (
    <div className="ml-5 w-0 flex-1">
      <dl>
        <dt className="text-sm font-medium text-muted-foreground truncate">{title}</dt>
        <dd className="text-2xl font-semibold">{value}</dd>
      </dl>
    </div>
  )
}

// Stat card change indicator
export function StatCardChange({ change }: { change: number }): JSX.Element {
  const isPositive = change >= 0

  return (
    <div className="mt-4">
      <div className="flex items-center text-sm">
        {isPositive ? (
          <TrendingUp className="flex-shrink-0 h-4 w-4 text-green-600" />
        ) : (
          <TrendingDown className="flex-shrink-0 h-4 w-4 text-red-500" />
        )}
        <span className={`ml-1 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {Math.abs(change).toFixed(1)}%
        </span>
        <span className="ml-1 text-muted-foreground">vs mês anterior</span>
      </div>

      {/* Advanced analytics - requires advanced_reports feature */}
      <FeatureGate feature="advanced_reports" upgradePromptMode="modal">
        <div className="mt-2 pt-2 border-t border-muted/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BarChart3 className="h-3 w-3" />
            <span>Análise de 90 dias disponível</span>
          </div>
        </div>
      </FeatureGate>

      {/* Premium insights - requires analytics feature */}
      <FeatureGate feature="analytics" upgradePromptMode="modal">
        <div className="mt-1">
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <Zap className="h-3 w-3" />
            <span>Insights preditivos ativados</span>
          </div>
        </div>
      </FeatureGate>
    </div>
  )
}

// Individual stat card component
export function StatCard({
  title,
  value,
  change,
  icon,
  color,
}: {
  title: string
  value: string | number
  change: number
  icon: React.ElementType
  color: string
}): JSX.Element {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <StatCardIcon icon={icon} color={color} />
          <StatCardContent title={title} value={value} />
        </div>
        <StatCardChange change={change} />
      </CardContent>
    </Card>
  )
}

// Stats cards component
export function StatsCards({ stats }: { stats: DashboardStats | null }): JSX.Element {
  const statCards = generateStatCardsData(stats)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map(card => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  )
}
