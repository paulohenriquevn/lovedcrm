/**
 * Provider Migration Wizard Component
 *
 * Step-by-step wizard for switching between providers with validation and safety checks.
 */

import { useState, useEffect } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useProviderSwitch, type ProvidersData, type Provider } from '@/hooks/use-provider-data'

import { WizardContent } from './migration-wizard-content'
import { useMigrationWizard, createNavigationHandlers } from './migration-wizard-handlers'
import { getProviderData } from './migration-wizard-utils'

import type { ValidationResult } from '@/services/providers'

interface MigrationResult {
  success: boolean
  message: string
  provider_id?: string
}

interface ProviderMigrationWizardProps {
  providerType: string
  providers: ProvidersData | null
  onClose: () => void
  onComplete: () => void
}

// Custom hook for wizard state management
function useWizardState(providerType: string): {
  currentStep: number
  setCurrentStep: (step: number) => void
  selectedProvider: Provider | null
  setSelectedProvider: (provider: Provider | null) => void
  validation: ValidationResult | null
  setValidation: (validation: ValidationResult | null) => void
  isValidating: boolean
  setIsValidating: (validating: boolean) => void
  migrationResult: MigrationResult | null
  setMigrationResult: (result: MigrationResult | null) => void
} {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)

  // Reset state when provider type changes
  useEffect(() => {
    setCurrentStep(0)
    setSelectedProvider(null)
    setValidation(null)
    setMigrationResult(null)
  }, [providerType])

  return {
    currentStep,
    setCurrentStep,
    selectedProvider,
    setSelectedProvider,
    validation,
    setValidation,
    isValidating,
    setIsValidating,
    migrationResult,
    setMigrationResult,
  }
}

export function ProviderMigrationWizard({
  providerType,
  providers,
  onClose,
  onComplete,
}: ProviderMigrationWizardProps): JSX.Element {
  const wizardState = useWizardState(providerType)
  const { switchProvider, validateSwitch, isLoading: isSwitching } = useProviderSwitch()

  // Get provider data using helper function
  const { currentPrimary, switchableProviders } = getProviderData(providers, providerType)

  // Migration logic hooks
  const { performValidation, performMigration } = useMigrationWizard(
    providerType,
    validateSwitch,
    switchProvider
  )

  // Navigation handlers
  const { handleNextStep, handlePreviousStep, handleComplete } = createNavigationHandlers({
    currentStep: wizardState.currentStep,
    setCurrentStep: wizardState.setCurrentStep,
    setMigrationResult: wizardState.setMigrationResult,
    performValidation,
    performMigration,
    setValidation: wizardState.setValidation,
    setIsValidating: wizardState.setIsValidating,
    selectedProvider: wizardState.selectedProvider,
    validation: wizardState.validation,
    migrationResult: wizardState.migrationResult,
    onComplete,
    onClose,
  })

  const handleProviderSelect = (provider: Provider): void => {
    wizardState.setSelectedProvider(provider)
  }

  const handleNext = (): void => {
    void handleNextStep()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Provider Migration Wizard</DialogTitle>
        </DialogHeader>

        <WizardContent
          currentStep={wizardState.currentStep}
          providerType={providerType}
          currentPrimary={currentPrimary}
          switchableProviders={switchableProviders}
          selectedProvider={wizardState.selectedProvider}
          onProviderSelect={handleProviderSelect}
          isValidating={wizardState.isValidating}
          validation={wizardState.validation}
          isSwitching={isSwitching}
          migrationResult={wizardState.migrationResult}
          onClose={onClose}
          onPrevious={handlePreviousStep}
          onNext={handleNext}
          onComplete={handleComplete}
        />
      </DialogContent>
    </Dialog>
  )
}
