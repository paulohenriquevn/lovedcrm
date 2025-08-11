/**
 * Provider Migration Wizard Utilities
 *
 * Helper functions and utilities extracted to reduce main component complexity
 */

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

import type { Provider } from '@/hooks/use-provider-data'
import type { ValidationResult } from '@/services/providers'

interface MigrationResult {
  success: boolean
  message: string
  provider_id?: string
}

export const STEPS = [
  'Provider Selection',
  'Safety Validation',
  'Migration Execution',
  'Confirmation',
]

// Progress Component
export function WizardProgress({
  currentStep,
  steps,
}: {
  currentStep: number
  steps: string[]
}): React.ReactElement {
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>
          Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}

// Navigation Actions Component
export function WizardActions({
  currentStep,
  selectedProvider,
  switchableProviders,
  validation,
  onClose,
  onPrevious,
  onNext,
  onComplete,
}: {
  currentStep: number
  selectedProvider: Provider | null
  switchableProviders: Provider[]
  validation: ValidationResult | null
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
  onComplete: () => void
}): React.ReactElement {
  return (
    <div className="flex justify-between">
      <div>
        {currentStep > 0 && currentStep < 3 && (
          <Button variant="outline" onClick={onPrevious}>
            Previous
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onClose}>
          {currentStep === 3 ? 'Close' : 'Cancel'}
        </Button>

        {currentStep === 0 && Boolean(selectedProvider) && switchableProviders.length > 0 && (
          <Button onClick={onNext}>Validate Switch</Button>
        )}

        {currentStep === 1 && validation?.safeToSwitch === true && (
          <Button onClick={onNext}>Execute Migration</Button>
        )}

        {currentStep === 3 && <Button onClick={onComplete}>Complete</Button>}
      </div>
    </div>
  )
}

// Helper function to get available providers
export function getProviderData(
  providers: {
    provider_types: Record<string, { providers: Provider[] }>
  } | null,
  providerType: string
): {
  availableProviders: Provider[]
  currentPrimary: Provider | undefined
  switchableProviders: Provider[]
} {
  const availableProviders: Provider[] = providers?.provider_types[providerType]?.providers ?? []
  const currentPrimary: Provider | undefined = availableProviders.find(
    (p: Provider) => p.is_primary
  )
  const switchableProviders: Provider[] = availableProviders.filter(
    (p: Provider) => !p.is_primary && (p.status === 'active' || p.status === 'inactive')
  )

  return {
    availableProviders,
    currentPrimary,
    switchableProviders,
  }
}

// Validation error handler
export function createValidationError(error: unknown): ValidationResult {
  return {
    safeToSwitch: false,
    warnings: [],
    blockers: [`Validation failed: ${String(error)}`],
    recommendations: [],
  }
}

// Migration error handler
export function createMigrationError(error: unknown): MigrationResult {
  return {
    success: false,
    message: `Migration failed: ${String(error)}`,
  }
}

// Step navigation helpers
export function canAdvanceFromStep(
  step: number,
  selectedProvider: Provider | null,
  validation: ValidationResult | null
): boolean {
  switch (step) {
    case 0: {
      return selectedProvider !== null
    }
    case 1: {
      return validation?.safeToSwitch === true
    }
    case 2: {
      return validation?.safeToSwitch === true
    }
    default: {
      return false
    }
  }
}

export function shouldShowPreviousButton(currentStep: number): boolean {
  return currentStep > 0 && currentStep < 3
}
