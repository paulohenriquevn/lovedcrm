/**
 * Provider Migration Wizard - Step 3: Migration Execution
 */

import { Alert, AlertDescription } from '@/components/ui/alert'

import type { Provider } from '@/hooks/use-provider-data'

interface MigrationResult {
  success: boolean
  message: string
  provider_id?: string
}

// Step 3: Migration Execution Component
export function MigrationExecutionStep({
  selectedProvider,
  isSwitching,
  migrationResult,
}: {
  selectedProvider: Provider | null
  isSwitching: boolean
  migrationResult: MigrationResult | null
}): React.ReactElement {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Migration Execution</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Performing atomic switch to {selectedProvider?.name}...
        </p>
      </div>

      {isSwitching ? (
        <MigrationLoader />
      ) : migrationResult ? (
        <MigrationResult result={migrationResult} />
      ) : null}
    </div>
  )
}

function MigrationLoader(): React.ReactElement {
  return (
    <div className="space-y-4 py-8">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        <span className="text-sm">Switching provider...</span>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        This operation is atomic and can be safely interrupted
      </div>
    </div>
  )
}

function MigrationResult({ result }: { result: MigrationResult }): React.ReactElement {
  return (
    <Alert className={result.success ? '' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}>
      <AlertDescription className="flex items-center gap-2">
        {result.success ? (
          <>
            <span className="text-green-600">✅</span>
            {result.message}
          </>
        ) : (
          <>
            <span className="text-red-600">❌</span>
            {result.message}
          </>
        )}
      </AlertDescription>
    </Alert>
  )
}
