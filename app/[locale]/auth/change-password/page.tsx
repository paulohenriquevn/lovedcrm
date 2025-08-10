'use client'

import { CheckCircle, Eye, EyeOff, Lock } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

// Compact Password Field Component
function PasswordField({
  label,
  name,
  placeholder,
  value,
  onChange,
  showPassword,
  onTogglePassword,
  error,
  disabled,
}: {
  label: string
  name: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  showPassword: boolean
  onTogglePassword: () => void
  error?: string
  disabled: boolean
}): JSX.Element {
  const hasError = error !== null && error !== undefined && error !== ''

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className={hasError ? 'border-red-500' : ''}
        />
        <button
          type="button"
          onClick={onTogglePassword}
          disabled={disabled}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hasError ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}

// Main Page Component
export default function ChangePasswordPage(): JSX.Element {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const email = searchParams.get('email') ?? ''
  const isFromTempPassword = searchParams.get('temp') === 'true'

  // Redirect if no email provided
  useEffect(() => {
    if (email === null || email === undefined || email === '') {
      void router.push('/auth/login')
    }
  }, [email, router])

  if (email === null || email === undefined || email === '') {
    return <div /> // Will redirect
  }

  return (
    <ChangePasswordContainer
      email={email}
      isFromTempPassword={isFromTempPassword}
      router={router}
      toast={toast}
    />
  )
}

// Form validation helper
function validatePasswordForm(
  formData: {
    tempPassword: string
    newPassword: string
    confirmPassword: string
  },
  tValidation: (key: string) => string
): Record<string, string> {
  const newErrors: Record<string, string> = {}

  if (formData.tempPassword.trim() === '') {
    newErrors.tempPassword = tValidation('tempPasswordRequired')
  }

  if (formData.newPassword.trim() === '') {
    newErrors.newPassword = tValidation('newPasswordRequired')
  } else if (formData.newPassword.length < 6) {
    newErrors.newPassword = tValidation('newPasswordMinLength')
  }

  if (formData.confirmPassword.trim() === '') {
    newErrors.confirmPassword = tValidation('confirmPasswordRequired')
  } else if (formData.newPassword !== formData.confirmPassword) {
    newErrors.confirmPassword = tValidation('passwordsNotMatch')
  }

  if (formData.tempPassword === formData.newPassword) {
    newErrors.newPassword = tValidation('newPasswordMustDiffer')
  }

  return newErrors
}

// API call helper
async function changePasswordApi(
  email: string,
  tempPassword: string,
  newPassword: string
): Promise<void> {
  const response = await fetch('/api/auth/force-change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      tempPassword,
      newPassword,
    }),
  })

  if (response.ok === false) {
    const errorData = (await response.json()) as { detail?: string }
    throw new Error(errorData.detail ?? 'Erro ao alterar senha')
  }

  await response.json()
}

// Success handler
function handlePasswordChangeSuccess(
  email: string,
  router: { push: (url: string) => void },
  toast: { (props: { title: string; description?: string }): void }
): void {
  toast({
    title: 'Senha alterada com sucesso!',
    description: 'Agora você pode fazer login com sua nova senha.',
  })

  setTimeout(() => {
    void router.push(`/auth/login?email=${encodeURIComponent(email)}`)
  }, 2000)
}

// Container Component
function ChangePasswordContainer({
  email,
  isFromTempPassword,
  router,
  toast,
}: {
  email: string
  isFromTempPassword: boolean
  router: { push: (url: string) => void; replace: (url: string) => void }
  toast: {
    (props: { title: string; description?: string; variant?: 'default' | 'destructive' }): void
  }
}): JSX.Element {
  const tValidation = useTranslations('auth.changePassword.validation')
  const [formData, setFormData] = useState({
    tempPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    temp: false,
    new: false,
    confirm: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    const validationErrors = validatePasswordForm(formData, tValidation)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsLoading(true)

    try {
      await changePasswordApi(email, formData.tempPassword, formData.newPassword)
      handlePasswordChangeSuccess(email, router, toast)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Verifique se a senha temporária está correta.'
      toast({
        title: 'Erro ao alterar senha',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field] !== null && errors[field] !== undefined && errors[field] !== '') {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <ChangePasswordForm
      email={email}
      isFromTempPassword={isFromTempPassword}
      formData={formData}
      showPasswords={showPasswords}
      setShowPasswords={setShowPasswords}
      errors={errors}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onInputChange={handleInputChange}
      router={router}
    />
  )
}

// Password requirements component
function PasswordRequirements({
  formData,
  tAuth,
}: {
  formData: { tempPassword: string; newPassword: string; confirmPassword: string }
  tAuth: (key: string) => string
}): JSX.Element {
  const requirements = [
    { text: 'Pelo menos 6 caracteres', met: formData.newPassword.length >= 6 },
    {
      text: 'Diferente da senha temporária',
      met: formData.newPassword !== formData.tempPassword && formData.newPassword !== '',
    },
    {
      text: 'Senhas coincidem',
      met: formData.newPassword === formData.confirmPassword && formData.confirmPassword !== '',
    },
  ]

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{tAuth('passwordRequirements')}:</p>
      <ul className="space-y-1">
        {requirements.map(req => (
          <li key={req.text} className="flex items-center space-x-2">
            <CheckCircle className={`h-4 w-4 ${req.met ? 'text-green-600' : 'text-gray-300'}`} />
            <span className={`text-sm ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
              {req.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Submit button component
function SubmitButton({
  isLoading,
  tAuth,
}: {
  isLoading: boolean
  tAuth: (key: string) => string
}): JSX.Element {
  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          {tAuth('changingPassword')}
        </>
      ) : (
        <>
          <Lock className="h-4 w-4 mr-2" />
          {tAuth('changePasswordAndLogin')}
        </>
      )}
    </Button>
  )
}

// Form fields component
function PasswordFields({
  formData,
  showPasswords,
  setShowPasswords,
  errors,
  isLoading,
  onInputChange,
  tAuth,
}: {
  formData: { tempPassword: string; newPassword: string; confirmPassword: string }
  showPasswords: { temp: boolean; new: boolean; confirm: boolean }
  setShowPasswords: React.Dispatch<
    React.SetStateAction<{ temp: boolean; new: boolean; confirm: boolean }>
  >
  errors: Record<string, string>
  isLoading: boolean
  onInputChange: (field: string, value: string) => void
  tAuth: (key: string) => string
}): JSX.Element {
  return (
    <>
      <PasswordField
        label={tAuth('tempPassword')}
        name="tempPassword"
        placeholder={tAuth('tempPasswordPlaceholder')}
        value={formData.tempPassword}
        onChange={value => onInputChange('tempPassword', value)}
        showPassword={showPasswords.temp}
        onTogglePassword={() => setShowPasswords(prev => ({ ...prev, temp: !prev.temp }))}
        error={errors.tempPassword}
        disabled={isLoading}
      />
      <PasswordField
        label={tAuth('newPassword')}
        name="newPassword"
        placeholder={tAuth('newPasswordPlaceholder')}
        value={formData.newPassword}
        onChange={value => onInputChange('newPassword', value)}
        showPassword={showPasswords.new}
        onTogglePassword={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
        error={errors.newPassword}
        disabled={isLoading}
      />
      <PasswordField
        label={tAuth('confirmNewPassword')}
        name="confirmPassword"
        placeholder={tAuth('confirmPasswordPlaceholder')}
        value={formData.confirmPassword}
        onChange={value => onInputChange('confirmPassword', value)}
        showPassword={showPasswords.confirm}
        onTogglePassword={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
        error={errors.confirmPassword}
        disabled={isLoading}
      />
    </>
  )
}

// Main form component
function ChangePasswordForm({
  email,
  isFromTempPassword,
  formData,
  showPasswords,
  setShowPasswords,
  errors,
  isLoading,
  onSubmit,
  onInputChange,
  router,
}: {
  email: string
  isFromTempPassword: boolean
  formData: { tempPassword: string; newPassword: string; confirmPassword: string }
  showPasswords: { temp: boolean; new: boolean; confirm: boolean }
  setShowPasswords: React.Dispatch<
    React.SetStateAction<{ temp: boolean; new: boolean; confirm: boolean }>
  >
  errors: Record<string, string>
  isLoading: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  onInputChange: (field: string, value: string) => void
  router: { push: (url: string) => void }
}): JSX.Element {
  const tAuth = useTranslations('auth.changePassword')

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{tAuth('title')}</CardTitle>
          <CardDescription>
            {isFromTempPassword
              ? tAuth('tempPasswordDescription')
              : tAuth('changePasswordFor', { email })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={e => void onSubmit(e)} className="space-y-4">
            <PasswordFields
              formData={formData}
              showPasswords={showPasswords}
              setShowPasswords={setShowPasswords}
              errors={errors}
              isLoading={isLoading}
              onInputChange={onInputChange}
              tAuth={tAuth}
            />
            <PasswordRequirements formData={formData} tAuth={tAuth} />
            <SubmitButton isLoading={isLoading} tAuth={tAuth} />
          </form>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => void router.push('/auth/login')}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
              disabled={isLoading}
            >
              ← {tAuth('backToLogin')}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
