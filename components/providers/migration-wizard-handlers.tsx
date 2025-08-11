/**
 * Provider Migration Wizard - Event Handlers and Logic
 *
 * Extracted handlers to reduce main component complexity
 */

import type { Provider } from '@/hooks/use-provider-data'
import type { ValidationResult } from '@/services/providers'

interface MigrationResult {
  success: boolean
  message: string
  provider_id?: string
}

// Hook for migration wizard state management
export function useMigrationWizard(
  providerType: string,
  validateSwitch: (type: string, id: string) => Promise<ValidationResult>,
  switchProvider: (type: string, id: string, isDryRun: boolean) => Promise<MigrationResult>
): {
  performValidation: (selectedProvider: Provider | null) => Promise<ValidationResult | null>
  performMigration: (selectedProvider: Provider | null) => Promise<MigrationResult | null>
} {
  const performValidation = async (
    selectedProvider: Provider | null
  ): Promise<ValidationResult | null> => {
    if (!selectedProvider) {
      return null
    }

    try {
      return await validateSwitch(providerType, selectedProvider.id)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Validation failed:', error)
      return {
        safe_to_switch: false,
        warnings: [],
        blockers: [`Validation failed: ${String(error)}`],
        recommendations: [],
      }
    }
  }

  const performMigration = async (
    selectedProvider: Provider | null
  ): Promise<MigrationResult | null> => {
    if (!selectedProvider) {
      return null
    }

    try {
      return await switchProvider(providerType, selectedProvider.id, false)
    } catch (error) {
      return {
        success: false,
        message: `Migration failed: ${String(error)}`,
      }
    }
  }

  return {
    performValidation,
    performMigration,
  }
}

interface NavigationHandlerOptions {
  currentStep: number
  setCurrentStep: (step: number) => void
  setMigrationResult: (result: MigrationResult | null) => void
  performValidation: (provider: Provider | null) => Promise<ValidationResult | null>
  performMigration: (provider: Provider | null) => Promise<MigrationResult | null>
  setValidation: (validation: ValidationResult | null) => void
  setIsValidating: (validating: boolean) => void
  selectedProvider: Provider | null
  validation: ValidationResult | null
  migrationResult: MigrationResult | null
  onComplete: () => void
  onClose: () => void
}

// Navigation handlers
export function createNavigationHandlers(options: NavigationHandlerOptions): {
  handleNextStep: () => Promise<void>
  handlePreviousStep: () => void
  handleComplete: () => void
} {
  const {
    currentStep,
    setCurrentStep,
    setMigrationResult,
    performValidation,
    performMigration,
    setValidation,
    setIsValidating,
    selectedProvider,
    validation,
    migrationResult,
    onComplete,
    onClose,
  } = options
  const handleNextStep = async (): Promise<void> => {
    if (currentStep === 0 && selectedProvider) {
      setCurrentStep(1)
      setIsValidating(true)
      const validationResult = await performValidation(selectedProvider)
      setValidation(validationResult)
      setIsValidating(false)
    } else if (currentStep === 1 && validation?.safe_to_switch === true) {
      setCurrentStep(2)
      const migrationResult = await performMigration(selectedProvider)
      setMigrationResult(migrationResult)
      if (migrationResult?.success === true) {
        setTimeout(() => setCurrentStep(3), 1000)
      }
    } else if (currentStep === 2 && migrationResult?.success === true) {
      setCurrentStep(3)
    }
  }

  const handlePreviousStep = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      if (currentStep === 2) {
        setMigrationResult(null)
      }
    }
  }

  const handleComplete = (): void => {
    onComplete()
    onClose()
  }

  return {
    handleNextStep,
    handlePreviousStep,
    handleComplete,
  }
}
