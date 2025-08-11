/**
 * Provider Migration Wizard - Content Component
 *
 * Extracted content component to reduce main file complexity
 */

import { ProviderSelectionStep } from './migration-wizard-step1'
import { SafetyValidationStep } from './migration-wizard-step2'
import { MigrationExecutionStep } from './migration-wizard-step3'
import { MigrationConfirmationStep } from './migration-wizard-step4'
import { STEPS, WizardProgress, WizardActions } from './migration-wizard-utils'

import type { Provider } from '@/hooks/use-provider-data'
import type { ValidationResult } from '@/services/providers'

interface MigrationResult {
  success: boolean
  message: string
  provider_id?: string
}

interface WizardContentProps {
  currentStep: number
  providerType: string
  currentPrimary: Provider | undefined
  switchableProviders: Provider[]
  selectedProvider: Provider | null
  onProviderSelect: (provider: Provider) => void
  isValidating: boolean
  validation: ValidationResult | null
  isSwitching: boolean
  migrationResult: MigrationResult | null
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
  onComplete: () => void
}

// Wizard content component
export function WizardContent(props: WizardContentProps): React.ReactElement {
  const {
    currentStep,
    selectedProvider,
    switchableProviders,
    validation,
    onClose,
    onPrevious,
    onNext,
    onComplete,
  } = props

  return (
    <div className="space-y-6">
      {/* Progress */}
      <WizardProgress currentStep={currentStep} steps={STEPS} />

      {/* Step Content */}
      <div className="min-h-[300px]">
        <WizardStepRenderer {...props} />
      </div>

      {/* Actions */}
      <WizardActions
        currentStep={currentStep}
        selectedProvider={selectedProvider}
        switchableProviders={switchableProviders}
        validation={validation}
        onClose={onClose}
        onPrevious={onPrevious}
        onNext={onNext}
        onComplete={onComplete}
      />
    </div>
  )
}

// Step renderer component
function WizardStepRenderer({
  currentStep,
  providerType,
  currentPrimary,
  switchableProviders,
  selectedProvider,
  onProviderSelect,
  isValidating,
  validation,
  isSwitching,
  migrationResult,
}: WizardContentProps): React.ReactElement | null {
  switch (currentStep) {
    case 0: {
      return (
        <ProviderSelectionStep
          providerType={providerType}
          currentPrimary={currentPrimary}
          switchableProviders={switchableProviders}
          selectedProvider={selectedProvider}
          onProviderSelect={onProviderSelect}
        />
      )
    }
    case 1: {
      return (
        <SafetyValidationStep
          selectedProvider={selectedProvider}
          isValidating={isValidating}
          validation={validation}
        />
      )
    }
    case 2: {
      return (
        <MigrationExecutionStep
          selectedProvider={selectedProvider}
          isSwitching={isSwitching}
          migrationResult={migrationResult}
        />
      )
    }
    case 3: {
      return (
        <MigrationConfirmationStep
          selectedProvider={selectedProvider}
          providerType={providerType}
        />
      )
    }
    default: {
      return null
    }
  }
}
