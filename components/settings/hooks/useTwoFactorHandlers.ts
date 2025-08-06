'use client'

import {
  createCopyHandler,
  createDisableHandler,
  createEnableHandler,
  createVerifyHandler,
} from './useTwoFactorHandlerUtils'

import type { TwoFactorAuthActions, TwoFactorAuthState } from './useTwoFactorAuth'

export interface TwoFactorHandlersProps {
  state: TwoFactorAuthState
  actions: TwoFactorAuthActions
  isEnabled: boolean
  onClose: () => void
  onEnable2FA: () => Promise<{ qr_code: string; secret: string }>
  onConfirm2FA: (code: string) => Promise<void>
  onDisable2FA: (code: string) => Promise<void>
}

export function useTwoFactorHandlers({
  state,
  actions,
  isEnabled,
  onClose,
  onEnable2FA,
  onConfirm2FA,
  onDisable2FA,
}: TwoFactorHandlersProps): {
  handleClose: () => void
  handleEnable2FA: () => void
  handleVerifyCode: () => void
  handleDisable2FA: () => void
  copySecret: () => void
} {
  const handleClose = (): void => {
    if (!state.isLoading) {
      actions.resetState(isEnabled)
      onClose()
    }
  }

  const handleEnable2FA = createEnableHandler(state, actions, onEnable2FA)
  const handleVerifyCode = createVerifyHandler(state, actions, {
    onConfirm2FA,
    onClose: handleClose,
  })
  const handleDisable2FA = createDisableHandler(state, actions, {
    onDisable2FA,
    onClose: handleClose,
  })
  const copySecret = createCopyHandler(state, actions)

  return {
    handleClose,
    handleEnable2FA,
    handleVerifyCode,
    handleDisable2FA,
    copySecret,
  }
}
