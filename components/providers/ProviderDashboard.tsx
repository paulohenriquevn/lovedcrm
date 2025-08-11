/**
 * Provider Management Dashboard Component
 *
 * Main dashboard for viewing and managing multiple providers per type.
 * Shows cost comparison, status, and provides quick switch actions.
 */

import {
  AddProviderSection,
  EmptyProvidersState,
  OverviewStats,
  ProviderTypeCard,
} from './provider-dashboard-components'
import { getProviderTypeInfo } from './provider-dashboard-constants'

import type { ProvidersData } from '@/hooks/use-provider-data'

interface ProviderDashboardProps {
  providers: ProvidersData | null
  onSwitchProvider: (providerType: string) => void
}

export function ProviderDashboard({
  providers,
  onSwitchProvider,
}: ProviderDashboardProps): JSX.Element {
  // Early return for empty state
  if (!providers || providers.total_providers === 0) {
    return <EmptyProvidersState />
  }

  return (
    <div className="space-y-6">
      <OverviewStats providers={providers} />

      <div className="space-y-4">
        {Object.entries(providers.provider_types).map(([providerType, typeData]) => {
          const typeInfo = getProviderTypeInfo(providerType)

          return (
            <ProviderTypeCard
              key={providerType}
              providerType={providerType}
              typeData={typeData}
              typeInfo={typeInfo}
              onSwitchProvider={onSwitchProvider}
            />
          )
        })}
      </div>

      <AddProviderSection />
    </div>
  )
}
