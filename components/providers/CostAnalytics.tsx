/**
 * Cost Analytics Component
 *
 * Displays cost comparison and optimization recommendations for providers.
 */

import { useProviderCostComparison } from '@/hooks/use-provider-data'

import {
  ComparisonTable,
  CostAnalyticsError,
  CostAnalyticsHeader,
  CostAnalyticsLoading,
  CostCard,
  Recommendations,
  SavingsCard,
} from './cost-analytics-components'
import {
  findCheapestProvider,
  findMostExpensiveProvider,
  findPrimaryProvider,
} from './cost-analytics-utils'

import type { CostAnalysisData, CostAnalyticsProps } from './cost-analytics-types'

function useCostAnalysisData(providerType: string): CostAnalysisData {
  const { costComparison, isLoading, error } = useProviderCostComparison(providerType)

  if (!costComparison?.providers || costComparison.providers.length === 0) {
    return {
      isLoading,
      hasError: Boolean(error) || !costComparison,
      providers: [],
      recommendations: [],
      cheapest: {
        id: '',
        name: '',
        monthly_cost: 0,
        cost_per_message: 0,
        is_primary: false,
        status: '',
      },
      mostExpensive: {
        id: '',
        name: '',
        monthly_cost: 0,
        cost_per_message: 0,
        is_primary: false,
        status: '',
      },
      primary: undefined,
      shouldShowSavings: false,
      hasRecommendations: false,
      hasMultipleProviders: false,
    }
  }

  const { providers, recommendations } = costComparison
  const cheapest = findCheapestProvider(providers)
  const mostExpensive = findMostExpensiveProvider(providers)
  const primary = findPrimaryProvider(providers)

  return {
    isLoading,
    hasError: false,
    providers,
    recommendations,
    cheapest,
    mostExpensive,
    primary,
    shouldShowSavings: Boolean(
      primary && primary.id !== cheapest.id && cheapest.monthly_cost < primary.monthly_cost
    ),
    hasRecommendations: recommendations.length > 0,
    hasMultipleProviders: providers.length > 2,
  }
}

export function CostAnalytics({ providerType }: CostAnalyticsProps): React.ReactElement {
  const {
    isLoading,
    hasError,
    providers,
    recommendations,
    cheapest,
    mostExpensive,
    primary,
    shouldShowSavings,
    hasRecommendations,
    hasMultipleProviders,
  } = useCostAnalysisData(providerType)

  if (isLoading) {
    return <CostAnalyticsLoading />
  }

  if (hasError || providers.length === 0) {
    return <CostAnalyticsError />
  }

  return (
    <div className="space-y-4">
      <CostAnalyticsHeader providerCount={providers.length} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CostCard provider={cheapest} title="Most Cost-Effective" variant="cost-effective" />
        <CostCard provider={mostExpensive} title="Premium Option" variant="premium" />
      </div>

      {shouldShowSavings === true && primary !== undefined ? (
        <SavingsCard primary={primary} cheapest={cheapest} />
      ) : null}

      {hasRecommendations === true ? <Recommendations recommendations={recommendations} /> : null}

      {hasMultipleProviders === true ? <ComparisonTable providers={providers} /> : null}
    </div>
  )
}
