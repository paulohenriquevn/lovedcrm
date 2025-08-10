'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import {
  BasicFields,
  PasswordField,
  TermsAcceptanceField,
} from '@/components/auth/RegisterFormFields'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { useAuthCheckAndRedirect, useRegisterSubmission } from '@/hooks/use-register-hooks'
import { useToast } from '@/hooks/use-toast'
import { createRegisterFormSchema, type RegisterFormData } from '@/lib/validation/register-schema'

// Register Form Fields Component
function RegisterFormFields({
  form,
  isLoading,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  tAuth,
  tPlaceholders,
  tButtons,
}: {
  form: ReturnType<typeof useForm<RegisterFormData>>
  isLoading: boolean
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (show: boolean) => void
  tAuth: (key: string) => string
  tPlaceholders: (key: string) => string
  tButtons: (key: string) => string
}): JSX.Element {
  return (
    <>
      <BasicFields form={form} isLoading={isLoading} tAuth={tAuth} tPlaceholders={tPlaceholders} />
      <PasswordField
        name="password"
        label={tAuth('register.password')}
        placeholder={tPlaceholders('password')}
        form={form}
        isLoading={isLoading}
        showPassword={showPassword}
        onToggleVisibility={() => setShowPassword(!showPassword)}
        tAuth={tAuth}
      />
      <PasswordField
        name="confirmPassword"
        label={tAuth('register.confirmPassword')}
        placeholder={tPlaceholders('confirmPassword')}
        form={form}
        isLoading={isLoading}
        showPassword={showConfirmPassword}
        onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
        tAuth={tAuth}
      />
      <TermsAcceptanceField form={form} isLoading={isLoading} tAuth={tAuth} />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {tButtons('createAccount')}...
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" />
            {tButtons('createAccount')}
          </>
        )}
      </Button>
    </>
  )
}

// Google Login Section Component
function GoogleLoginSection({
  onError,
  isLoading,
  tAuth,
}: {
  onError: (error: string) => void
  isLoading: boolean
  tAuth: (key: string) => string
}): JSX.Element {
  return (
    <div className="mb-6">
      <GoogleLoginButton onError={onError} disabled={isLoading} />
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {tAuth('common.orContinueWith')}
          </span>
        </div>
      </div>
    </div>
  )
}

// Login Link Footer Component
function LoginLinkFooter({
  locale,
  tAuth,
  tLinks,
}: {
  locale: string
  tAuth: (key: string) => string
  tLinks: (key: string) => string
}): JSX.Element {
  return (
    <div className="text-center text-sm text-muted-foreground">
      {tAuth('register.haveAccount')}{' '}
      <Link href={`/${locale}/auth/login`} className="font-medium text-primary hover:underline">
        {tLinks('signIn')}
      </Link>
    </div>
  )
}

// Register Form Container Component
function RegisterFormContainer(): JSX.Element {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const locale = useLocale()
  const { toast } = useToast()

  // Translations
  const t = useTranslations()
  const tAuth = useTranslations('auth')
  const tButtons = useTranslations('buttons')
  const tPlaceholders = useTranslations('placeholders')
  const tLinks = useTranslations('links')

  useAuthCheckAndRedirect()
  const { handleSubmit, isLoading } = useRegisterSubmission(tAuth)

  // Create form schema with translations
  const registerFormSchema = createRegisterFormSchema(t)

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema as any),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    },
  })

  const handleGoogleError = (error: string): void => {
    toast({
      title: tAuth('register.error.title'),
      description: error,
      variant: 'destructive',
    })
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">{tAuth('register.title')}</CardTitle>
        <CardDescription className="text-center">{tAuth('register.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleLoginSection onError={handleGoogleError} isLoading={isLoading} tAuth={tAuth} />

        <Form {...form}>
          <form
            onSubmit={e => {
              e.preventDefault()
              form
                .handleSubmit(handleSubmit)(e)
                .catch((error: unknown) => {
                  // Handle form submission errors silently in production
                  if (process.env.NODE_ENV === 'development') {
                    // eslint-disable-next-line no-console
                    console.error('Form submission error:', error)
                  }
                })
            }}
            className="space-y-4"
          >
            <RegisterFormFields
              form={form}
              isLoading={isLoading}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              tAuth={tAuth}
              tPlaceholders={tPlaceholders}
              tButtons={tButtons}
            />
          </form>
        </Form>

        <LoginLinkFooter locale={locale} tAuth={tAuth} tLinks={tLinks} />
      </CardContent>
    </Card>
  )
}

// Hero Section Component
function RegisterHeroSection(): JSX.Element {
  const tAuth = useTranslations('auth')

  return (
    <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700" />
      <div className="relative z-20 flex items-center text-lg font-medium">
        <UserPlus className="mr-2 h-6 w-6" />
        {tAuth('common.brandName')}
      </div>
      <div className="relative z-20 mt-auto">
        <blockquote className="space-y-2">
          <p className="text-lg">{tAuth('register.testimonial.text')}</p>
          <footer className="text-sm">{tAuth('register.testimonial.author')}</footer>
        </blockquote>
      </div>
    </div>
  )
}

export default function RegisterPage(): JSX.Element {
  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <RegisterHeroSection />
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <RegisterFormContainer />
        </div>
      </div>
    </div>
  )
}
