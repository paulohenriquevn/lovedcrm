'use client'

import { DisableStep, QRCodeStep, SetupStep, VerifyStep } from './TwoFactorSteps'

import type { TwoFactorAuthState, TwoFactorAuthActions } from '../hooks/useTwoFactorAuth'

interface ContentRendererProps {
  state: TwoFactorAuthState
  actions: TwoFactorAuthActions
  handlers: {
    handleClose: () => void
    handleEnable2FA: () => void
    handleVerifyCode: () => void
    handleDisable2FA: () => void
    handleCopySecret: () => void
  }
}

export function TwoFactorContentRenderer({
  state,
  actions,
  handlers,
}: ContentRendererProps): JSX.Element {
  const handleCodeChange = (code: string): void => {
    actions.setVerificationCode(code)
  }

  switch (state.step) {
    case 'setup': {
      return (
        <SetupStep
          onNext={handlers.handleEnable2FA}
          onClose={handlers.handleClose}
          isLoading={state.isLoading}
        />
      )
    }
    case 'qr-code': {
      return (
        <QRCodeStep
          qrData={state.qrData}
          secretCopied={state.secretCopied}
          onCopySecret={handlers.handleCopySecret}
          onNext={() => actions.setStep('verify')}
          onClose={handlers.handleClose}
          isLoading={state.isLoading}
        />
      )
    }
    case 'verify': {
      return (
        <VerifyStep
          verificationCode={state.verificationCode}
          onCodeChange={handleCodeChange}
          onVerify={handlers.handleVerifyCode}
          onClose={handlers.handleClose}
          isLoading={state.isLoading}
          error={state.error}
        />
      )
    }
    case 'disable': {
      return (
        <DisableStep
          verificationCode={state.verificationCode}
          onCodeChange={handleCodeChange}
          onDisable={handlers.handleDisable2FA}
          onClose={handlers.handleClose}
          isLoading={state.isLoading}
          error={state.error}
        />
      )
    }
    default: {
      return <div>Etapa não encontrada</div>
    }
  }
}
