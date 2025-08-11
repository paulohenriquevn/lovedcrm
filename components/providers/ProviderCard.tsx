/**
 * Provider Card Component
 *
 * Individual provider card showing status, cost, and features.
 * Used in the provider dashboard for each configured provider.
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card'

import {
  ProviderCardActions,
  ProviderCardCost,
  ProviderCardFeatures,
  ProviderCardHeader,
  ProviderCardLimits,
} from './provider-card-components'

import type { ProviderLimits, ProviderMetadata } from './provider-card-types'
import type { Provider } from '@/hooks/use-provider-data'

interface ProviderCardProps {
  provider: Provider
  onAction?: () => void
}

/**
 * Type guard to check if value is a valid object for limits
 */
function isValidLimitsObject(value: unknown): value is Record<string, unknown> {
  return value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Extract and validate metadata from provider
 */
function extractProviderMetadata(metadata: Record<string, unknown>): ProviderMetadata {
  const costPerMessage =
    typeof metadata?.cost_per_message === 'number' ? metadata.cost_per_message : 0
  const monthlyCost = typeof metadata?.monthly_cost === 'number' ? metadata.monthly_cost : 0
  const features = Array.isArray(metadata?.features)
    ? metadata.features.filter((f): f is string => typeof f === 'string')
    : []
  const limits = isValidLimitsObject(metadata?.limits) ? (metadata.limits as ProviderLimits) : {}

  return {
    costPerMessage,
    monthlyCost,
    features,
    limits,
  }
}

export function ProviderCard({ provider, onAction }: ProviderCardProps): React.ReactElement {
  // Extract and validate metadata with proper typing
  const metadata = extractProviderMetadata(provider.metadata)
  const costPerMessage = metadata.costPerMessage ?? 0
  const monthlyCost = metadata.monthlyCost ?? 0
  const features = metadata.features ?? []
  const limits = metadata.limits ?? {}

  return (
    <Card
      className={`relative transition-all duration-200 hover:shadow-md ${
        provider.is_primary
          ? 'ring-2 ring-blue-500 dark:ring-blue-400'
          : 'hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600'
      }`}
    >
      <CardHeader className="pb-3">
        <ProviderCardHeader
          name={provider.name}
          status={provider.status}
          isPrimary={provider.is_primary}
          priority={provider.priority}
        />
      </CardHeader>

      <CardContent className="pt-0">
        <ProviderCardCost costPerMessage={costPerMessage} monthlyCost={monthlyCost} />

        <ProviderCardFeatures features={features} />

        <ProviderCardLimits limits={limits} />

        {Boolean(provider.last_sync_at) && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Last sync: {new Date(provider.last_sync_at).toLocaleString()}
          </div>
        )}

        <ProviderCardActions
          status={provider.status}
          isPrimary={provider.is_primary}
          onAction={onAction}
        />
      </CardContent>
    </Card>
  )
}
