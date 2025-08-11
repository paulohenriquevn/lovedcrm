/**
 * Provider Migration Wizard - Step 2: Safety Validation
 */

import { Alert, AlertDescription } from '@/components/ui/alert'

import type { Provider } from '@/hooks/use-provider-data'
import type { ValidationResult } from '@/services/providers'

// Step 2: Safety Validation Component
export function SafetyValidationStep({
  selectedProvider,
  isValidating,
  validation,
}: {
  selectedProvider: Provider | null
  isValidating: boolean
  validation: ValidationResult | null
}): React.ReactElement {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Safety Validation</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Checking if it&apos;s safe to switch to {selectedProvider?.name}...
        </p>
      </div>

      {isValidating ? (
        <ValidationLoader />
      ) : validation ? (
        <ValidationResults validation={validation} selectedProvider={selectedProvider} />
      ) : null}
    </div>
  )
}

function ValidationLoader(): React.ReactElement {
  return (
    <div className="flex items-center gap-3 py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      <span className="text-sm">Validating switch safety...</span>
    </div>
  )
}

function ValidationResults({
  validation,
  selectedProvider,
}: {
  validation: ValidationResult
  selectedProvider: Provider | null
}): React.ReactElement {
  return (
    <div className="space-y-4">
      {/* Validation Status */}
      <Alert
        className={validation.safe_to_switch ? '' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}
      >
        <AlertDescription className="flex items-center gap-2">
          {validation.safe_to_switch ? (
            <>
              <span className="text-green-600">✅</span>
              Safe to switch to {selectedProvider?.name}
            </>
          ) : (
            <>
              <span className="text-red-600">❌</span>
              Switch blocked due to safety concerns
            </>
          )}
        </AlertDescription>
      </Alert>

      <ValidationBlockers blockers={validation.blockers} />
      <ValidationWarnings warnings={validation.warnings} />
      <ValidationRecommendations recommendations={validation.recommendations} />
    </div>
  )
}

function ValidationBlockers({ blockers }: { blockers: string[] }): React.ReactElement | null {
  if (blockers.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-red-600 dark:text-red-400">Blockers:</h4>
      {blockers.map(blocker => (
        <Alert key={blocker} className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription>🚫 {blocker}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}

function ValidationWarnings({ warnings }: { warnings: string[] }): React.ReactElement | null {
  if (warnings.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-yellow-600 dark:text-yellow-400">Warnings:</h4>
      {warnings.map(warning => (
        <Alert key={warning} className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertDescription>⚠️ {warning}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}

function ValidationRecommendations({
  recommendations,
}: {
  recommendations: string[]
}): React.ReactElement | null {
  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-blue-600 dark:text-blue-400">Recommendations:</h4>
      {recommendations.map(rec => (
        <Alert key={rec} className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <AlertDescription>💡 {rec}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
