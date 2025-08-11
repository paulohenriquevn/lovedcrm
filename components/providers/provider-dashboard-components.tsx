/**
 * Provider Dashboard Helper Components
 *
 * Helper components for the Provider Dashboard to reduce complexity
 * and improve maintainability following project patterns.
 */

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { CostAnalytics } from './CostAnalytics'
import { ProviderCard } from './ProviderCard'
import { StatusIndicator } from './StatusIndicator'

import type { ProvidersData } from '@/hooks/use-provider-data'

/**
 * Empty state component when no providers are configured
 */
export function EmptyProvidersState(): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Providers Configured
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Set up your first communication provider to get started.
          </p>
          <Button>Add Provider</Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface OverviewStatsProps {
  providers: ProvidersData
}

/**
 * Overview statistics grid showing provider counts and stats
 */
export function OverviewStats({ providers }: OverviewStatsProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Providers
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {providers.total_providers}
              </p>
            </div>
            <div className="text-2xl">🔧</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Providers
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {providers.active_providers}
              </p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Provider Types</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Object.keys(providers.provider_types).length}
              </p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ProviderTypeCardProps {
  providerType: string
  typeData: ProvidersData['provider_types'][string]
  typeInfo: { name: string; icon: string }
  onSwitchProvider: (providerType: string) => void
}

/**
 * Individual provider type card showing all providers of that type
 */
export function ProviderTypeCard({
  providerType,
  typeData,
  typeInfo,
  onSwitchProvider,
}: ProviderTypeCardProps): JSX.Element {
  const hasPrimary =
    typeData.primary !== null && typeData.primary !== undefined && typeData.primary.length > 0

  return (
    <Card key={providerType}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">{typeInfo.icon}</span>
            <div>
              <h3 className="text-lg font-semibold">{typeInfo.name} Providers</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                {typeData.total} configured • {typeData.active} active
                {hasPrimary ? (
                  <>
                    {' • '}
                    <span className="font-medium">Primary: {typeData.primary}</span>
                  </>
                ) : null}
              </p>
            </div>
          </CardTitle>

          <div className="flex items-center gap-2">
            <StatusIndicator status={typeData.active > 0 ? 'active' : 'inactive'} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSwitchProvider(providerType)}
              disabled={typeData.total <= 1}
            >
              Switch Provider
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {typeData.providers.map(provider => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onAction={() => onSwitchProvider(providerType)}
            />
          ))}
        </div>

        {/* Show cost analytics if more than one provider */}
        {typeData.total > 1 ? (
          <>
            <Separator className="my-6" />
            <CostAnalytics providerType={providerType} />
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}

/**
 * Add new provider section
 */
export function AddProviderSection(): JSX.Element {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Add New Provider</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configure additional providers for redundancy and cost optimization
            </p>
          </div>
          <Button variant="outline">Add Provider</Button>
        </div>
      </CardContent>
    </Card>
  )
}
