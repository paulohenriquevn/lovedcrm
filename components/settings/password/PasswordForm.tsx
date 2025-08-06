import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

import { PasswordInput } from './PasswordInput'

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

interface PasswordFormProps {
  formData: PasswordFormData
  onClose: () => void
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export function PasswordForm({ formData, onClose, onSubmit }: PasswordFormProps): JSX.Element {
  const tSettings = useTranslations('settings.password')
  const tCommon = useTranslations('common')

  return (
    <form
      onSubmit={(e): void => {
        void onSubmit(e)
      }}
      className="space-y-4"
    >
      <PasswordInput
        id="currentPassword"
        label={tSettings('currentPassword')}
        placeholder={tSettings('currentPasswordPlaceholder')}
        field={formData.currentPassword}
        onValueChange={(value): void => formData.setCurrentPassword(prev => ({ ...prev, value }))}
        onToggleVisibility={(): void => formData.togglePasswordVisibility('current')}
        isLoading={formData.isLoading}
      />

      <PasswordInput
        id="newPassword"
        label={tSettings('newPassword')}
        placeholder={tSettings('newPasswordPlaceholder')}
        field={formData.newPassword}
        onValueChange={(value): void => formData.setNewPassword(prev => ({ ...prev, value }))}
        onToggleVisibility={(): void => formData.togglePasswordVisibility('new')}
        isLoading={formData.isLoading}
        note={tSettings('minimumCharacters')}
      />

      <PasswordInput
        id="confirmPassword"
        label={tSettings('confirmNewPassword')}
        placeholder={tSettings('confirmPasswordPlaceholder')}
        field={formData.confirmPassword}
        onValueChange={(value): void => formData.setConfirmPassword(prev => ({ ...prev, value }))}
        onToggleVisibility={(): void => formData.togglePasswordVisibility('confirm')}
        isLoading={formData.isLoading}
      />

      {Boolean(formData.error) && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {formData.error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" type="button" onClick={onClose} disabled={formData.isLoading}>
          {tCommon('cancel')}
        </Button>
        <Button type="submit" disabled={formData.isLoading}>
          {formData.isLoading ? tSettings('changing') : tSettings('changePassword')}
        </Button>
      </div>
    </form>
  )
}
