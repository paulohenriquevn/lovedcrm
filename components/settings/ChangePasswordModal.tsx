'use client'

import { Key } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { PasswordForm } from './password/PasswordForm'
import { usePasswordForm } from './password/usePasswordForm'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onChangePassword,
}: ChangePasswordModalProps): JSX.Element {
  const formData = usePasswordForm(onChangePassword)

  const handleClose = (): void => {
    if (!formData.isLoading) {
      formData.resetForm()
      onClose()
    }
  }

  const handleSuccessfulSubmit = async (e: React.FormEvent): Promise<void> => {
    await formData.handleSubmit(e)
    if (formData.error === null && !formData.isLoading) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Alterar Senha
          </DialogTitle>
          <DialogDescription>
            Digite sua senha atual e escolha uma nova senha segura.
          </DialogDescription>
        </DialogHeader>

        <PasswordForm formData={formData} onClose={handleClose} onSubmit={handleSuccessfulSubmit} />
      </DialogContent>
    </Dialog>
  )
}
