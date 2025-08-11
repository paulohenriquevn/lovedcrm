/**
 * Provider Migration Wizard - Step 1: Provider Selection
 */

import { StatusIndicator } from '@/components/providers/StatusIndicator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

import type { Provider } from '@/hooks/use-provider-data'

// Step 1: Provider Selection Component
export function ProviderSelectionStep({
  providerType,
  currentPrimary,
  switchableProviders,
  selectedProvider,
  onProviderSelect,
}: {
  providerType: string
  currentPrimary: Provider | undefined
  switchableProviders: Provider[]
  selectedProvider: Provider | null
  onProviderSelect: (provider: Provider) => void
}): React.ReactElement {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Select New Provider</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose which provider should become the primary for {providerType} communications.
        </p>
      </div>

      {Boolean(currentPrimary) && (
        <Alert className="mb-4">
          <AlertDescription>
            Currently using: <strong>{currentPrimary?.name}</strong> as primary provider
          </AlertDescription>
        </Alert>
      )}

      {switchableProviders.length === 0 ? (
        <Alert>
          <AlertDescription>
            No alternative providers available for switching. You need at least one additional
            configured provider to perform a switch.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-3">
          {switchableProviders.map(provider => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isSelected={selectedProvider?.id === provider.id}
              onSelect={() => onProviderSelect(provider)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Helper Components
function ProviderCard({
  provider,
  isSelected,
  onSelect,
}: {
  provider: Provider
  isSelected: boolean
  onSelect: () => void
}): React.ReactElement {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-blue-500 dark:ring-blue-400'
          : 'hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RadioButton isSelected={isSelected} />
            <div>
              <div className="font-medium">{provider.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {provider.metadata?.monthly_cost !== null &&
                provider.metadata?.monthly_cost !== undefined
                  ? `$${provider.metadata.monthly_cost}/month`
                  : 'Free'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusIndicator status={provider.status} />
            <Badge variant={provider.status === 'active' ? 'default' : 'secondary'}>
              {provider.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RadioButton({ isSelected }: { isSelected: boolean }): React.ReactElement {
  return (
    <div
      className={`w-4 h-4 rounded-full border-2 ${
        isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'
      }`}
    >
      {Boolean(isSelected) && <div className="w-full h-full rounded-full bg-white scale-50" />}
    </div>
  )
}
