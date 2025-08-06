'use client'

import type { TwoFactorAuthActions, TwoFactorAuthState } from './useTwoFactorAuth'

export function createEnableHandler(
  state: TwoFactorAuthState,
  actions: TwoFactorAuthActions,
  onEnable2FA: () => Promise<{ qr_code: string; secret: string }>
) {
  return (): void => {
    if (state.isLoading) {
      return
    }

    actions.setIsLoading(true)
    actions.setError(null)

    onEnable2FA()
      .then(data => {
        actions.setQrData(data)
        actions.setStep('qr-code')
      })
      .catch(error => {
        actions.setError(error instanceof Error ? error.message : 'Erro ao ativar 2FA')
      })
      .finally(() => {
        actions.setIsLoading(false)
      })
  }
}

export function createVerifyHandler(
  state: TwoFactorAuthState,
  actions: TwoFactorAuthActions,
  handlers: { onConfirm2FA: (code: string) => Promise<void>; onClose: () => void }
) {
  return (): void => {
    if (
      state.verificationCode === null ||
      state.verificationCode === undefined ||
      state.verificationCode.trim() === ''
    ) {
      actions.setError('Digite o código de verificação')
      return
    }

    if (state.isLoading) {
      return
    }

    actions.setIsLoading(true)
    actions.setError(null)

    handlers
      .onConfirm2FA(state.verificationCode)
      .then(() => {
        // Intentional log for 2FA success
        // eslint-disable-next-line no-console
        void console.log('2FA enabled successfully')
        handlers.onClose()
      })
      .catch(error => {
        actions.setError(error instanceof Error ? error.message : 'Código inválido')
      })
      .finally(() => {
        actions.setIsLoading(false)
      })
  }
}

export function createDisableHandler(
  state: TwoFactorAuthState,
  actions: TwoFactorAuthActions,
  handlers: { onDisable2FA: (code: string) => Promise<void>; onClose: () => void }
) {
  return (): void => {
    if (
      state.verificationCode === null ||
      state.verificationCode === undefined ||
      state.verificationCode.trim() === ''
    ) {
      actions.setError('Digite o código de verificação para desativar')
      return
    }

    if (state.isLoading) {
      return
    }

    actions.setIsLoading(true)
    actions.setError(null)

    handlers
      .onDisable2FA(state.verificationCode)
      .then(() => {
        // Intentional log for 2FA disable success
        // eslint-disable-next-line no-console
        void console.log('2FA disabled successfully')
        handlers.onClose()
      })
      .catch(error => {
        actions.setError(error instanceof Error ? error.message : 'Código inválido')
      })
      .finally(() => {
        actions.setIsLoading(false)
      })
  }
}

export function createCopyHandler(state: TwoFactorAuthState, actions: TwoFactorAuthActions) {
  return (): void => {
    if (
      state.qrData?.secret !== null &&
      state.qrData?.secret !== undefined &&
      state.qrData?.secret !== ''
    ) {
      navigator.clipboard
        .writeText(state.qrData.secret)
        .then(() => {
          actions.setSecretCopied(true)
          setTimeout(() => actions.setSecretCopied(false), 2000)
        })
        .catch(error => {
          // Intentional error log for clipboard failure
          // eslint-disable-next-line no-console
          void console.error('Failed to copy secret:', error)
        })
    }
  }
}
