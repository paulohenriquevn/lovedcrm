/**
 * Provider Card Components
 * Sub-components extracted from ProviderCard for better maintainability and reduced complexity
 */

import { StatusIndicator } from '@/components/providers/StatusIndicator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { formatCost, getStatusColor } from './provider-card-utils'

import type {
  ProviderActionsProps,
  ProviderCostDisplayProps,
  ProviderFeaturesProps,
  ProviderHeaderProps,
  ProviderLimitsProps,
} from './provider-card-types'

/**
 * Provider card header with name, status, and priority
 */
export function ProviderCardHeader({
  name,
  status,
  isPrimary,
  priority,
}: ProviderHeaderProps): React.ReactElement {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">{name}</h4>
          {Boolean(isPrimary) && (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Primary
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <StatusIndicator status={status} />
          <Badge className={getStatusColor(status)} variant="secondary">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </div>

      {priority > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400">Priority: {priority}</div>
      )}
    </div>
  )
}

/**
 * Provider cost information display
 */
export function ProviderCardCost({
  costPerMessage,
  monthlyCost,
}: ProviderCostDisplayProps): React.ReactElement | null {
  if (costPerMessage <= 0 && monthlyCost <= 0) {
    return null
  }

  return (
    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
      <div className="grid grid-cols-2 gap-2 text-sm">
        {costPerMessage > 0 && (
          <div>
            <span className="text-gray-600 dark:text-gray-400">Per message:</span>
            <div className="font-medium">{formatCost(costPerMessage)}</div>
          </div>
        )}
        {monthlyCost > 0 && (
          <div>
            <span className="text-gray-600 dark:text-gray-400">Monthly:</span>
            <div className="font-medium">${monthlyCost.toFixed(2)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Provider features display
 */
export function ProviderCardFeatures({
  features,
}: ProviderFeaturesProps): React.ReactElement | null {
  if (features.length === 0) {
    return null
  }

  return (
    <div className="mb-4">
      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Features:</div>
      <div className="flex flex-wrap gap-1">
        {features.slice(0, 3).map((feature: string) => (
          <Badge key={feature} variant="outline" className="text-xs">
            {feature}
          </Badge>
        ))}
        {features.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{features.length - 3} more
          </Badge>
        )}
      </div>
    </div>
  )
}

/**
 * Provider limits display
 */
export function ProviderCardLimits({ limits }: ProviderLimitsProps): React.ReactElement | null {
  if (Object.keys(limits ?? {}).length === 0) {
    return null
  }

  return (
    <div className="mb-4">
      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Limits:</div>
      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        {Boolean(limits?.max_messages_monthly) && (
          <div>Max messages: {limits.max_messages_monthly}/month</div>
        )}
        {Boolean(limits?.rate_limit) && <div>Rate limit: {limits.rate_limit}/min</div>}
      </div>
    </div>
  )
}

/**
 * Provider action buttons
 */
export function ProviderCardActions({
  status,
  isPrimary,
  onAction,
}: ProviderActionsProps): React.ReactElement {
  return (
    <div className="flex gap-2">
      {!isPrimary && status === 'active' && (
        <Button size="sm" variant="outline" onClick={onAction} className="flex-1">
          Make Primary
        </Button>
      )}

      {status === 'inactive' && (
        <Button size="sm" variant="outline" className="flex-1">
          Activate
        </Button>
      )}

      {status === 'error' && (
        <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:text-red-700">
          Fix Error
        </Button>
      )}

      <Button size="sm" variant="ghost" className="text-xs px-2">
        Configure
      </Button>
    </div>
  )
}
