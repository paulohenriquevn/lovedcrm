'use client'

import { useState } from 'react'

export type Step = 'setup' | 'qr-code' | 'verify' | 'disable'

export interface QRData {
  qr_code: string
  secret: string
}

export interface TwoFactorAuthState {
  step: Step
  qrData: QRData | null
  verificationCode: string
  isLoading: boolean
  error: string | null
  secretCopied: boolean
}

export interface TwoFactorAuthActions {
  setStep: (step: Step) => void
  setQrData: (data: QRData | null) => void
  setVerificationCode: (code: string) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSecretCopied: (copied: boolean) => void
  resetState: (isEnabled: boolean) => void
}

export function useTwoFactorAuth(isEnabled: boolean): {
  state: TwoFactorAuthState
  actions: TwoFactorAuthActions
} {
  const [step, setStep] = useState<Step>(isEnabled ? 'disable' : 'setup')
  const [qrData, setQrData] = useState<QRData | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [secretCopied, setSecretCopied] = useState(false)

  const resetState = (enabled: boolean): void => {
    setStep(enabled ? 'disable' : 'setup')
    setQrData(null)
    setVerificationCode('')
    setError(null)
    setSecretCopied(false)
  }

  const state: TwoFactorAuthState = {
    step,
    qrData,
    verificationCode,
    isLoading,
    error,
    secretCopied,
  }

  const actions: TwoFactorAuthActions = {
    setStep,
    setQrData,
    setVerificationCode,
    setIsLoading,
    setError,
    setSecretCopied,
    resetState,
  }

  return {
    state,
    actions,
  }
}
