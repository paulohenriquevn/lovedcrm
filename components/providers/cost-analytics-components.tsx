/**
 * Cost Analytics Components
 * Sub-components extracted from CostAnalytics for better maintainability and reduced complexity
 */

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { calculateSavings, formatCostPerMessage, formatCurrency } from './cost-analytics-utils'

import type {
  ComparisonTableProps,
  CostCardProps,
  RecommendationsProps,
  SavingsCardProps,
} from './cost-analytics-types'

/**
 * Loading skeleton for cost analytics
 */
export function CostAnalyticsLoading(): React.ReactElement {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      </div>
    </div>
  )
}

/**
 * Error state for cost analytics
 */
export function CostAnalyticsError(): React.ReactElement {
  return (
    <div className="text-sm text-gray-500 dark:text-gray-400">Unable to load cost comparison</div>
  )
}

/**
 * Header section with title and provider count
 */
export function CostAnalyticsHeader({
  providerCount,
}: {
  providerCount: number
}): React.ReactElement {
  return (
    <div className="flex items-center gap-2">
      <h4 className="font-medium text-gray-900 dark:text-gray-100">
        💰 Cost Analytics & Optimization
      </h4>
      <Badge variant="outline" className="text-xs">
        {providerCount} providers
      </Badge>
    </div>
  )
}

/**
 * Cost comparison card for cheapest/most expensive providers
 */
export function CostCard({ provider, title, variant }: CostCardProps): React.ReactElement {
  const colorClasses = {
    'cost-effective': {
      title: 'text-green-600 dark:text-green-400',
      badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    premium: {
      title: 'text-orange-600 dark:text-orange-400',
      badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    },
  }

  const { title: titleClass, badge: badgeClass } = colorClasses[variant]

  return (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className={`text-sm font-medium ${titleClass}`}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="font-semibold text-lg">{provider.name}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {formatCurrency(provider.monthly_cost)}/month
          </div>
          {provider.cost_per_message > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatCostPerMessage(provider.cost_per_message)} per message
            </div>
          )}
          {Boolean(provider.is_primary) && (
            <Badge className={badgeClass}>
              {variant === 'cost-effective' ? 'Current Primary ✓' : 'Current Primary'}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Potential savings card
 */
export function SavingsCard({ primary, cheapest }: SavingsCardProps): React.ReactElement {
  const { amount, percentage } = calculateSavings(primary, cheapest)

  return (
    <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-green-600 dark:text-green-400 text-xl">💡</div>
          <div className="flex-1">
            <div className="font-medium text-green-800 dark:text-green-200 mb-1">
              Potential Monthly Savings
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              Switch from {primary.name} to {cheapest.name} to save{' '}
              <span className="font-bold">{formatCurrency(amount)}/month</span> (
              {percentage.toFixed(1)}% reduction)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Optimization recommendations section
 */
export function Recommendations({ recommendations }: RecommendationsProps): React.ReactElement {
  return (
    <div className="space-y-2">
      <h5 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
        📊 Optimization Recommendations
      </h5>
      <div className="space-y-2">
        {recommendations.map(recommendation => (
          <div
            key={recommendation}
            className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border-l-2 border-blue-200 dark:border-blue-800"
          >
            {recommendation}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Detailed comparison table
 */
export function ComparisonTable({ providers }: ComparisonTableProps): React.ReactElement {
  return (
    <div className="space-y-2">
      <h5 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
        📋 Detailed Comparison
      </h5>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">
                Provider
              </th>
              <th className="text-right py-2 font-medium text-gray-700 dark:text-gray-300">
                Monthly Cost
              </th>
              <th className="text-right py-2 font-medium text-gray-700 dark:text-gray-300">
                Per Message
              </th>
              <th className="text-center py-2 font-medium text-gray-700 dark:text-gray-300">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {providers.map(provider => (
              <tr
                key={provider.id}
                className={`border-b border-gray-100 dark:border-gray-800 ${
                  provider.is_primary ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    {provider.name}
                    {Boolean(provider.is_primary) && (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="text-right py-2">{formatCurrency(provider.monthly_cost)}</td>
                <td className="text-right py-2">
                  {provider.cost_per_message > 0
                    ? formatCostPerMessage(provider.cost_per_message)
                    : 'Free'}
                </td>
                <td className="text-center py-2">
                  <Badge
                    className={`text-xs ${
                      provider.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {provider.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
