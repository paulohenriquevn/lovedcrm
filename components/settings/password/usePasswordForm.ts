import { useState } from 'react'

interface PasswordField {
  value: string
  visible: boolean
}

interface PasswordFormData {
  currentPassword: PasswordField
  newPassword: PasswordField
  confirmPassword: PasswordField
  isLoading: boolean
  error: string | null
  setCurrentPassword: React.Dispatch<React.SetStateAction<PasswordField>>
  setNewPassword: React.Dispatch<React.SetStateAction<PasswordField>>
  setConfirmPassword: React.Dispatch<React.SetStateAction<PasswordField>>
  resetForm: () => void
  togglePasswordVisibility: (field: 'current' | 'new' | 'confirm') => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

function validatePasswords(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): string | null {
  if (currentPassword.length === 0) {
    return 'Senha atual é obrigatória'
  }
  if (newPassword.length === 0) {
    return 'Nova senha é obrigatória'
  }
  if (newPassword.length < 8) {
    return 'Nova senha deve ter pelo menos 8 caracteres'
  }
  if (newPassword !== confirmPassword) {
    return 'Confirmação da senha não confere'
  }
  if (currentPassword === newPassword) {
    return 'Nova senha deve ser diferente da atual'
  }
  return null
}

export function usePasswordForm(
  onChangePassword: (current: string, newPass: string) => Promise<void>
): PasswordFormData {
  const [currentPassword, setCurrentPassword] = useState<PasswordField>({
    value: '',
    visible: false,
  })
  const [newPassword, setNewPassword] = useState<PasswordField>({
    value: '',
    visible: false,
  })
  const [confirmPassword, setConfirmPassword] = useState<PasswordField>({
    value: '',
    visible: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = (): void => {
    setCurrentPassword({ value: '', visible: false })
    setNewPassword({ value: '', visible: false })
    setConfirmPassword({ value: '', visible: false })
    setError(null)
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm'): void => {
    switch (field) {
      case 'current': {
        setCurrentPassword(prev => ({ ...prev, visible: !prev.visible }))
        break
      }
      case 'new': {
        setNewPassword(prev => ({ ...prev, visible: !prev.visible }))
        break
      }
      case 'confirm': {
        setConfirmPassword(prev => ({ ...prev, visible: !prev.visible }))
        break
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)

    const validationError = validatePasswords(
      currentPassword.value,
      newPassword.value,
      confirmPassword.value
    )
    if (validationError !== null) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    try {
      await onChangePassword(currentPassword.value, newPassword.value)
      resetForm()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao alterar senha')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    currentPassword,
    newPassword,
    confirmPassword,
    isLoading,
    error,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    resetForm,
    togglePasswordVisibility,
    handleSubmit,
  }
}
