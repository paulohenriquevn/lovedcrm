'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { useTwoFactorAuth } from './hooks/useTwoFactorAuth'
import { useTwoFactorHandlers } from './hooks/useTwoFactorHandlers'
import { TwoFactorContentRenderer } from './two-factor/TwoFactorContentRenderer'

interface TwoFactorAuthModalProps {
  isOpen: boolean
  onClose: () => void
  isEnabled: boolean
  onEnable2FA: () => Promise<{ qr_code: string; secret: string }>
  onConfirm2FA: (code: string) => Promise<void>
  onDisable2FA: (code: string) => Promise<void>
}

export function TwoFactorAuthModal({
  isOpen,
  onClose,
  isEnabled,
  onEnable2FA,
  onConfirm2FA,
  onDisable2FA,
}: TwoFactorAuthModalProps): JSX.Element {
  const { state, actions } = useTwoFactorAuth(isEnabled)
  const { handleClose, handleEnable2FA, handleVerifyCode, handleDisable2FA, copySecret } =
    useTwoFactorHandlers({
      state,
      actions,
      isEnabled,
      onClose,
      onEnable2FA,
      onConfirm2FA,
      onDisable2FA,
    })

  const handlers = {
    handleClose,
    handleEnable2FA,
    handleVerifyCode,
    handleDisable2FA,
    handleCopySecret: copySecret,
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEnabled ? 'Gerenciar 2FA' : 'Ativar 2FA'}</DialogTitle>
          <DialogDescription>
            {isEnabled
              ? 'Gerencie sua autenticação de dois fatores'
              : 'Configure a autenticação de dois fatores para sua conta'}
          </DialogDescription>
        </DialogHeader>
        <TwoFactorContentRenderer state={state} actions={actions} handlers={handlers} />
      </DialogContent>
    </Dialog>
  )
}
