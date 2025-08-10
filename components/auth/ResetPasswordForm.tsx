/**
 * Formulário de reset de senha - componente puro seguindo padrão shadcn/ui.
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CheckCircle, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  createResetPasswordSchema,
  type ResetPasswordData,
} from '@/lib/validation/reset-password-schema'

interface ResetPasswordFormProps {
  onSubmit: (data: { password: string; confirmPassword: string }) => void
  onBackToLogin: () => void
  isLoading?: boolean
  isSuccess?: boolean
  hasToken?: boolean
}

// Success state component
function ResetPasswordSuccess({
  onBackToLogin,
  tReset,
}: {
  onBackToLogin: () => void
  tReset: (key: string) => string
}): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-center">{tReset('success.title')}</CardTitle>
          <CardDescription className="text-center">{tReset('success.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onBackToLogin} className="w-full">
            {tReset('success.signIn')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Invalid token component
function InvalidToken({
  onBackToLogin,
  tReset,
}: {
  onBackToLogin: () => void
  tReset: (key: string) => string
}): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-900">
            <KeyRound className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-center">{tReset('noToken.title')}</CardTitle>
          <CardDescription className="text-center">{tReset('noToken.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/auth/forgot-password" className="w-full">
            <Button className="w-full">{tReset('noToken.requestNew')}</Button>
          </Link>
          <Button variant="ghost" onClick={onBackToLogin} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {tReset('success.signIn')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Form header component
function ResetPasswordHeader({ tReset }: { tReset: (key: string) => string }): JSX.Element {
  return (
    <CardHeader className="space-y-1">
      <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-primary/10">
        <KeyRound className="h-6 w-6 text-primary" />
      </div>
      <CardTitle className="text-2xl text-center">{tReset('form.title')}</CardTitle>
      <CardDescription className="text-center">{tReset('form.subtitle')}</CardDescription>
    </CardHeader>
  )
}

// Password field component
function PasswordField({
  form,
  name,
  label,
  placeholder,
  showPassword,
  setShowPassword,
  isLoading,
}: {
  form: ReturnType<typeof useForm<ResetPasswordData>>
  name: 'password' | 'confirmPassword'
  label: string
  placeholder: string
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  isLoading: boolean
}): JSX.Element {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label} *</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={placeholder}
                disabled={isLoading}
                className="pr-10"
                {...field}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Form actions component
function ResetPasswordActions({
  isLoading,
  onBackToLogin,
  tReset,
}: {
  isLoading: boolean
  onBackToLogin: () => void
  tReset: (key: string) => string
}): JSX.Element {
  return (
    <div className="space-y-3">
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {tReset('form.updating')}...
          </>
        ) : (
          tReset('form.updatePassword')
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={onBackToLogin}
        className="w-full"
        disabled={isLoading}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {tReset('form.backToLogin')}
      </Button>
    </div>
  )
}

// Form content component
function ResetPasswordFormContent({
  form,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onSubmit,
  onBackToLogin,
  isLoading,
  tReset,
  tPlaceholder,
}: {
  form: ReturnType<typeof useForm<ResetPasswordData>>
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (show: boolean) => void
  onSubmit: (data: ResetPasswordData) => void
  onBackToLogin: () => void
  isLoading: boolean
  tReset: (key: string) => string
  tPlaceholder: (key: string) => string
}): JSX.Element {
  const handleFormSubmit = (data: ResetPasswordData): void => {
    onSubmit(data)
  }

  return (
    <CardContent className="space-y-4">
      <Form {...form}>
        <form
          onSubmit={e => {
            e.preventDefault()
            void form.handleSubmit(handleFormSubmit)(e)
          }}
          className="space-y-4"
        >
          <PasswordField
            form={form}
            name="password"
            label={tReset('form.newPassword')}
            placeholder={tPlaceholder('newPassword')}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isLoading={isLoading}
          />
          <PasswordField
            form={form}
            name="confirmPassword"
            label={tReset('form.confirmPassword')}
            placeholder={tPlaceholder('confirmPassword')}
            showPassword={showConfirmPassword}
            setShowPassword={setShowConfirmPassword}
            isLoading={isLoading}
          />
          <ResetPasswordActions
            isLoading={isLoading}
            onBackToLogin={onBackToLogin}
            tReset={tReset}
          />
        </form>
      </Form>
    </CardContent>
  )
}

export function ResetPasswordForm({
  onSubmit,
  onBackToLogin,
  isLoading = false,
  isSuccess = false,
  hasToken = true,
}: ResetPasswordFormProps): JSX.Element {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const tReset = useTranslations('resetPassword')
  const tPlaceholder = useTranslations('placeholders')
  const tValidation = useTranslations('validation')
  const resetPasswordSchema = createResetPasswordSchema(tValidation)

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema as any),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const handleSubmit = (data: ResetPasswordData): void => {
    onSubmit(data)
  }

  if (isSuccess) {
    return <ResetPasswordSuccess onBackToLogin={onBackToLogin} tReset={tReset} />
  }

  if (!hasToken) {
    return <InvalidToken onBackToLogin={onBackToLogin} tReset={tReset} />
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <Card className="w-full max-w-md">
        <ResetPasswordHeader tReset={tReset} />
        <ResetPasswordFormContent
          form={form}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          onSubmit={handleSubmit}
          onBackToLogin={onBackToLogin}
          isLoading={isLoading}
          tReset={tReset}
          tPlaceholder={tPlaceholder}
        />
      </Card>
    </div>
  )
}
