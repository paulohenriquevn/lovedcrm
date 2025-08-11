/**
 * Cost Analytics Types
 * Type definitions for cost analytics components
 */

export interface Provider {
  id: string
  name: string
  monthly_cost: number
  cost_per_message: number
  is_primary: boolean
  status: string
}

export interface CostComparison {
  providers: Provider[]
  recommendations: string[]
}

export interface CostAnalyticsProps {
  providerType: string
}

export interface CostCardProps {
  provider: Provider
  title: string
  variant: 'cost-effective' | 'premium'
}

export interface SavingsCardProps {
  primary: Provider
  cheapest: Provider
}

export interface RecommendationsProps {
  recommendations: string[]
}

export interface ComparisonTableProps {
  providers: Provider[]
}

export interface CostAnalysisData {
  isLoading: boolean
  hasError: boolean
  providers: Provider[]
  recommendations: string[]
  cheapest: Provider
  mostExpensive: Provider
  primary?: Provider
  shouldShowSavings: boolean
  hasRecommendations: boolean
  hasMultipleProviders: boolean
}
