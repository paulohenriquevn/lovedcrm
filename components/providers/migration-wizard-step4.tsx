/**
 * Provider Migration Wizard - Step 4: Migration Confirmation
 */

import { Alert, AlertDescription } from '@/components/ui/alert'

import type { Provider } from '@/hooks/use-provider-data'

// Step 4: Confirmation Component
export function MigrationConfirmationStep({
  selectedProvider,
  providerType,
}: {
  selectedProvider: Provider | null
  providerType: string
}): React.ReactElement {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Migration Complete</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Successfully switched to {selectedProvider?.name} as the primary provider.
        </p>
      </div>

      <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
        <AlertDescription>
          🎉 Provider migration completed successfully! {selectedProvider?.name} is now handling all{' '}
          {providerType} communications.
        </AlertDescription>
      </Alert>

      <NextStepsInfo />
    </div>
  )
}

function NextStepsInfo(): React.ReactElement {
  return (
    <div className="space-y-2">
      <h4 className="font-medium">Next Steps:</h4>
      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
        <li>• Monitor the new provider&apos;s performance</li>
        <li>• Update any external integrations if needed</li>
        <li>• Review cost analytics in the dashboard</li>
      </ul>
    </div>
  )
}
