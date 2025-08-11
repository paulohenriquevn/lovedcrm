/**
 * Provider Card Types
 * TypeScript interfaces for proper type safety in ProviderCard components
 */

export interface ProviderMetadata {
  costPerMessage?: number
  monthlyCost?: number
  features?: string[]
  limits?: ProviderLimits
}

export interface ProviderLimits {
  max_messages_monthly?: number
  rate_limit?: number
}

export interface ProviderCostDisplayProps {
  costPerMessage: number
  monthlyCost: number
}

export interface ProviderFeaturesProps {
  features: string[]
}

export interface ProviderLimitsProps {
  limits: ProviderLimits
}

export interface ProviderHeaderProps {
  name: string
  status: 'active' | 'inactive' | 'error' | 'pending'
  isPrimary: boolean
  priority: number
}

export interface ProviderActionsProps {
  status: 'active' | 'inactive' | 'error' | 'pending'
  isPrimary: boolean
  onAction?: () => void
}
