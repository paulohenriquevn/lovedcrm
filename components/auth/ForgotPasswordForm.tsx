/**
 * Formulário de recuperação de senha - componente puro seguindo padrão shadcn/ui.
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Mail, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

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

interface ForgotPasswordFormProps {
  onSubmit: (data: { email: string }) => void
  onBackToLogin: () => void
  isLoading?: boolean
  isSuccess?: boolean
}

const createForgotPasswordSchema = (t: (key: string) => string): z.ZodSchema<{ email: string }> =>
  z.object({
    email: z.string().email(t('emailInvalid')),
  })

type ForgotPasswordData = {
  email: string
}

// Success state component
function ForgotPasswordSuccess({
  email,
  onBackToLogin,
  onResend,
  isLoading,
  tForgot,
}: {
  email: string
  onBackToLogin: () => void
  onResend: () => void
  isLoading: boolean
  tForgot: (key: string) => string
}): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-green-100 dark:bg-green-900">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-center">{tForgot('success.title')}</CardTitle>
          <CardDescription className="text-center">
            {tForgot('success.description')}{' '}
            <span className="font-medium text-foreground">{email}</span>,{' '}
            {tForgot('success.instructions')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground text-center">
            {tForgot('success.checkSpam')}
          </p>

          <div className="space-y-3">
            <Button variant="secondary" onClick={onResend} disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              {tForgot('success.resendEmail')}
            </Button>

            <Button variant="ghost" onClick={onBackToLogin} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tForgot('backToLogin')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Form header component
function ForgotPasswordHeader({ tForgot }: { tForgot: (key: string) => string }): JSX.Element {
  return (
    <CardHeader className="space-y-1">
      <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-primary/10">
        <Mail className="h-6 w-6 text-primary" />
      </div>
      <CardTitle className="text-2xl text-center">{tForgot('title')}</CardTitle>
      <CardDescription className="text-center">{tForgot('subtitle')}</CardDescription>
    </CardHeader>
  )
}

// Form fields component
function ForgotPasswordEmailField({
  form,
  isLoading,
  tForgot,
  tPlaceholder,
}: {
  form: ReturnType<typeof useForm<ForgotPasswordData>>
  isLoading: boolean
  tForgot: (key: string) => string
  tPlaceholder: (key: string) => string
}): JSX.Element {
  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{tForgot('email')} *</FormLabel>
          <FormControl>
            <Input
              type="email"
              placeholder={tPlaceholder('email')}
              disabled={isLoading}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Form actions component
function ForgotPasswordActions({
  isLoading,
  onBackToLogin,
  tForgot,
}: {
  isLoading: boolean
  onBackToLogin: () => void
  tForgot: (key: string) => string
}): JSX.Element {
  return (
    <div className="space-y-3">
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {tForgot('sending')}...
          </>
        ) : (
          tForgot('sendInstructions')
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
        {tForgot('backToLogin')}
      </Button>
    </div>
  )
}

// Form content component
function ForgotPasswordFormContent({
  form,
  isLoading,
  onSubmit,
  onBackToLogin,
  tForgot,
  tPlaceholder,
}: {
  form: ReturnType<typeof useForm<ForgotPasswordData>>
  isLoading: boolean
  onSubmit: (data: ForgotPasswordData) => void
  onBackToLogin: () => void
  tForgot: (key: string) => string
  tPlaceholder: (key: string) => string
}): JSX.Element {
  const handleFormSubmit = (data: ForgotPasswordData): void => {
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
          <ForgotPasswordEmailField
            form={form}
            isLoading={isLoading}
            tForgot={tForgot}
            tPlaceholder={tPlaceholder}
          />
          <ForgotPasswordActions
            isLoading={isLoading}
            onBackToLogin={onBackToLogin}
            tForgot={tForgot}
          />
        </form>
      </Form>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {tForgot('noAccount')}{' '}
          <Link href="/auth/register" className="font-medium text-primary hover:underline">
            {tForgot('createAccount')}
          </Link>
        </p>
      </div>
    </CardContent>
  )
}

function ForgotPasswordFormMain({
  onSubmit,
  onBackToLogin,
  isLoading,
  setSubmittedEmail,
}: {
  onSubmit: (data: ForgotPasswordData) => void
  onBackToLogin: () => void
  isLoading: boolean
  setSubmittedEmail: (email: string) => void
}): JSX.Element {
  const tForgot = useTranslations('auth.forgotPassword')
  const tPlaceholder = useTranslations('placeholders')
  const tValidation = useTranslations('validation')
  const forgotPasswordSchema = createForgotPasswordSchema(tValidation)

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const handleSubmit = (data: ForgotPasswordData): void => {
    setSubmittedEmail(data.email)
    onSubmit(data)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <Card className="w-full max-w-md">
        <ForgotPasswordHeader tForgot={tForgot} />
        <ForgotPasswordFormContent
          form={form}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onBackToLogin={onBackToLogin}
          tForgot={tForgot}
          tPlaceholder={tPlaceholder}
        />
      </Card>
    </div>
  )
}

export function ForgotPasswordForm({
  onSubmit,
  onBackToLogin,
  isLoading = false,
  isSuccess = false,
}: ForgotPasswordFormProps): JSX.Element {
  const [submittedEmail, setSubmittedEmail] = useState('')
  const tForgot = useTranslations('auth.forgotPassword')

  const handleResend = (): void => {
    if (submittedEmail) {
      onSubmit({ email: submittedEmail })
    }
  }

  if (isSuccess) {
    return (
      <ForgotPasswordSuccess
        email={submittedEmail}
        onBackToLogin={onBackToLogin}
        onResend={handleResend}
        isLoading={isLoading}
        tForgot={tForgot}
      />
    )
  }

  return (
    <ForgotPasswordFormMain
      onSubmit={onSubmit}
      onBackToLogin={onBackToLogin}
      isLoading={isLoading}
      setSubmittedEmail={setSubmittedEmail}
    />
  )
}
